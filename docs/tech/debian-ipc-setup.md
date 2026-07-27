---
title: "Debian 13 工控机完整实施文档"
author: 渡娘
date: 2026-07-27
nav: 技术
visibility: public
draft: false
feishu_doc: GIvtdaQM8oNVfhxywa3cnPXWnCr
feishu_url: https://my.feishu.cn/docx/GIvtdaQM8oNVfhxywa3cnPXWnCr
platforms:
  - blog
tags:
  - 技术
  - Debian
  - Docker
  - SSH
description: Debian 13 工控机完整实施文档
---

# Debian 13 工控机完整实施文档

> **项目**：xxxx微电网 · **10kW**（在xxxx 代码基础上迭代）  
> **目标机**：Debian 13 Trixie 工控机（hostname / Tailscale：`landa-ipc`）  
> **开发机**：Windows + Cursor，经 Tailscale SSH 远程运维  
> **文档用途**：汇总本轮从「装 Docker / 远程 SSH」到「LXQt 桌面 + 运维小助手」的**全部步骤、命令、弯路与结论**  
> **仓库路径**：`tools/docs/debian-ipc-setup.md`

---

## 〇、当前终态（2026-07 实操结论）

| 项 | 现状 |
|-|-|
| 远程 SSH | `ssh root@landa-ipc`（Tailscale MagicDNS）或 `ssh root@100.x.x.x` |
| 业务容器 | `microgrid-backend` + `microgrid-frontend`，开机后台 `up`（不挡桌面） |
| 访问 | 本机 `http://127.0.0.1/`；远程 `http://landa-ipc/` / `http://100.x.x.x/` |
| 现场 UI | **LXQt 桌面**（非 VT/Kiosk）：桌面图标点「业务大屏 / 运维小助手 / 终端」 |
| 桌面账号 | `ops` / `ops123`（自动登录） |
| 大屏账号 | `admin` / `admin123` |
| 运维菜单 | `microgrid-ops`：↑↓ 选择 + 数字键；**本地启停不拉镜像**，仅「远程更新」pull |
| 不推荐 | Ctrl+Alt+F1/F2 切 TTY、无头 cage/weston 双屏半幅（已踩坑废弃） |

```Plaintext
┌────────────────────── 开发机 (Windows) ──────────────────────┐
│  Cursor / SSH / 浏览器                                        │
│  ssh root@landa-ipc                                           │
│  http://landa-ipc/                                            │
└────────────────────────────┬─────────────────────────────────┘
                             │ Tailscale (100.x.x.x)
┌────────────────────────────▼─────────────────────────────────┐
│ 工控机 landa-ipc · Debian 13                                  │
│  ├─ docker + microgrid-compose（后台 up，不挡进桌面）            │
│  ├─ sddm + LXQt（ops 自动登录）                                 │
│  │    ├─ 业务大屏 → microgrid-chromium（禁翻译）               │
│  │    ├─ 运维小助手 → debian-manager.sh                         │
│  │    └─ 系统终端 / Onboard 软键盘                             │
│  ├─ sshd + tailscaled                                         │
│  ├─ （可选）mihomo :7890                                      │
│  └─ apt: 清华源；Docker: registry-mirrors                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 一、实施路线总览（按真实时间线）

| 阶段 | 目标 | 关键结论 |
|-|-|-|
| A | 工控机能上网、装 OpenSSH | apt 源勿留空/cdrom；root 常无 `sudo` |
| B | 跨热点远程 SSH | **必须 Tailscale**，不能指望局域网 IP |
| C | Docker + 镜像加速 | 手机热点下用 **docker.io + 清华 apt**，官方 `download.docker.com` 常 SSL 失败 |
| D | 拉 ghcr 私有镜像 | `docker login ghcr.io`；慢时用 mihomo |
| E | 本地显示 | **半屏**因 HDMI+DP 双输出；VT 切换不友好 → **改 LXQt** |
| F | 运维体验 | 桌面图标 + 运维小助手本地启停；compose 异步免长黑屏 |

---

## 二、阶段 A：系统基础与上网

### 2.1 精简安装注意

- 默认 `multi-user.target`（无桌面）亦可；本轮最终改为 `graphical.target` + LXQt。
- 用户常为 **root 且无 sudo**：命令里 `sudo` 在 root 下可省略。

### 2.2 apt 源（手机热点推荐清华）

若 `apt update` 无 Hit/Get，或 `has no installation candidate`：

```Bash
cat > /etc/apt/sources.list <<'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/debian trixie main contrib non-free non-free-firmware
deb https://mirrors.tuna.tsinghua.edu.cn/debian trixie-updates main contrib non-free non-free-firmware
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security trixie-security main contrib non-free non-free-firmware
EOF
apt update
```

### 2.3 上网方式实操结论

| 方式 | 结论 |
|-|-|
| 有线 LAN | 最好，但现场常没有 |
| Android USB 网络共享 | 较稳；网卡名常为 `enx…`，需 up + DHCP/`dhclient` |
| iPhone USB | 常需 `usbmuxd` + 信任；无弹窗时难用 |
| Wi‑Fi 热点 | 可用；换热点后局域网 IP 会变，**SSH 请走 Tailscale** |

```Bash
ip -br a
# Android 共享示例
ip link set enxXXXXXXXX up
dhclient enxXXXXXXXX   # 或手动: ip addr add 192.168.42.2/24 dev enx…; ip route add default via 192.168.42.129
ping -c 2 8.8.8.8
```

`Network is unreachable`：先查默认路由与 USB 共享是否真正开启，再 `systemctl restart tailscaled`。

### 2.4 OpenSSH

```Bash
apt install -y openssh-server
systemctl enable --now ssh

# Debian 默认常禁止 root 密码登录 → 密码对也会 Permission denied
cat > /etc/ssh/sshd_config.d/99-root-password.conf <<'EOF'
PermitRootLogin yes
PasswordAuthentication yes
EOF
systemctl reload ssh
passwd root   # 仅临时调试；随后改公钥更安全
```

开发机配置公钥后建议：

```Bash
# 工控机
mkdir -p /root/.ssh && chmod 700 /root/.ssh
# 将开发机 ~/.ssh/id_ed25519.pub 追加到 authorized_keys
chmod 600 /root/.ssh/authorized_keys
```

---

## 三、阶段 B：Tailscale 远程运维（核心）

### 3.1 为何必须 Tailscale

- 工控机常用手机热点 → **无公网入站**，开发机无法直连 `192.168.x.x`。
- 换热点 IP 就变；Cursor/开发机常不在同一网段。
- Tailscale：双方出站即可，入口固定为 `100.x.x.x` / `landa-ipc`。

### 3.2 工控机安装

仓库脚本：`ops/terminal/setup-tailscale-ipc.sh`

```Bash
# 从 Windows 拷贝后务必去 CRLF！
sed -i 's/\r$//' setup-tailscale-ipc.sh

bash setup-tailscale-ipc.sh --hostname landa-ipc
# 或 Auth Key（无本机浏览器）：
# bash setup-tailscale-ipc.sh --hostname landa-ipc --auth-key 'tskey-auth-xxxx'
```

手工等价：

```Bash
curl -fsSL https://tailscale.com/install.sh | sh
systemctl enable --now tailscaled
tailscale up --hostname=landa-ipc --accept-dns=false
tailscale ip -4
```

> `--accept-dns=false`：降低热点下 apt DNS 被改写的概率。

### 3.3 开发机

1. 安装并登录同一 Tailscale 账号。
2. 连接：

```PowerShell
ssh root@landa-ipc
# 或
ssh root@100.x.x.x
```

本轮实操 MagicDNS 主机名：`landa-ipc`（示例 IPv4 曾为 `100.65.170.30`，以 `tailscale ip -4` 为准）。

---

## 四、阶段 C：Docker Engine + 镜像加速

### 4.1 推荐路径（手机热点验证通过）

**不要**优先用 `download.docker.com`（热点下常 TLS reset）。

```Bash
apt update
apt install -y ca-certificates curl gnupg docker.io docker-compose
systemctl enable --now docker

mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ],
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
EOF
systemctl restart docker
docker run --rm hello-world
```

### 4.2 部署目录

```Bash
mkdir -p /opt/microgrid/ops/terminal
# 从开发机 scp：
# scp docker-compose.remote.yml .env.docker.example ops/terminal/*.sh root@landa-ipc:/opt/microgrid/...
cd /opt/microgrid
cp .env.docker.example .env.docker
# 编辑 DEMO_MODE=true（演示）或 false（真机串口）
nano .env.docker
```

关键环境变量示例见仓库 `.env.docker.example`。

---

## 五、阶段 D：私有镜像 ghcr +（可选）代理

### 5.1 登录并拉取

```Bash
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin

cd /opt/microgrid
docker compose -f docker-compose.remote.yml --env-file .env.docker pull
docker compose -f docker-compose.remote.yml --env-file .env.docker up -d
docker ps
curl -sI http://127.0.0.1/ | head -3
```

> PAT 勿提交 git；用过后应轮换。

### 5.2 可选：mihomo（Clash Meta）

热点拉 `ghcr.io` / GitHub 失败时：

1. 开发机下载 `mihomo-linux-amd64-*.gz`，scp 到工控机。
2. 安装到 `/usr/local/bin/mihomo`，订阅写入 `/etc/mihomo/config.yaml`（`mixed-port: 7890`）。
3. systemd 启用 `mihomo`；Docker 可配 `HTTP_PROXY=http://127.0.0.1:7890`（注意绕过内网）。

GEOIP/MMDB 下载卡住时可简化配置、先保证节点可用。

### 5.3 开机自启业务（异步，不挡桌面）

```Bash
# 由 setup-ipc-desktop / fix-ipc-menu-boot 写入
systemctl enable --now microgrid-compose.service
# ExecStart 后台 docker compose up -d，立即返回，避免开机黑屏卡 30s+
```

并建议：

```Bash
systemctl disable --now NetworkManager-wait-online.service
systemctl mask NetworkManager-wait-online.service
docker update --restart unless-stopped microgrid-backend microgrid-frontend
```

---

## 六、阶段 E：本地显示演进（弯路 → 终态）

### 6.1 走过的弯路（勿再默认采用）

| 方案 | 现象 | 原因 / 结论 |
|-|-|-|
| cage + Chromium `--kiosk` 占 tty | 全屏卡住、难回终端 | 无桌面壳，退出路径差 |
| Weston `--tty=2` | 直接 fatal | **Weston 14 已不支持 `--tty=`** |
| HDMI + DP/VGA 同时点亮 | **画面只显示左半边** | 合成器跨双屏；须只启用主屏 `mode=off` 其余 |
| Ctrl+Alt+F1/F2 切 VT | 黑屏只剩光标、切不回 | DRM 未释放；现场人员不会用快捷键 |
| 运维菜单 `choice="$(echo 菜单…)"` | 只见「请输入序号」、序号无效 | 菜单被命令替换吞掉 |

### 6.2 终态：LXQt 桌面（推荐）

一键脚本（开发机 scp 后执行）：

```Bash
# 开发机
scp ops/terminal/setup-ipc-desktop.sh ops/terminal/debian-manager.sh `
  ops/terminal/microgrid-chromium.sh ops/terminal/fix-ipc-ops-autostart.sh `
  ops/terminal/fix-ipc-menu-boot.sh `
  root@landa-ipc:/opt/microgrid/ops/terminal/

# 工控机
sed -i 's/\r$//' /opt/microgrid/ops/terminal/*.sh
bash /opt/microgrid/ops/terminal/setup-ipc-desktop.sh
# 然后按需：
bash /opt/microgrid/ops/terminal/fix-ipc-ops-autostart.sh
bash /opt/microgrid/ops/terminal/fix-ipc-menu-boot.sh
```

脚本作用摘要：

- 停用旧 `microgrid-kiosk` / `microgrid-vt-watch` / `kiosk-debug`
- 安装 LXQt + SDDM，`ops` 自动登录
- 桌面图标：业务大屏 / 运维小助手 / 系统终端 / 使用说明
- 大屏：`microgrid-chromium`（`--disable-translate` 等，减少谷歌翻译弹窗）
- 软键盘：无物理键盘时 Onboard
- `systemctl set-default graphical.target`

### 6.3 现场操作（给调试人员）

| 需求 | 做法 |
|-|-|
| 看大屏 | 点「业务大屏」（开机也会尝试自启） |
| 运维 | 点「运维小助手」：↑↓ + Enter，或数字键；底部有「请输入序号」提示 |
| 本地启停容器 | 菜单 1/2/3 — **不 pull** |
| 拉新镜像 | 菜单「远程更新」 |
| 从大屏回桌面 | Alt+F4，或移到屏幕底边点任务栏 |
| 触屏打字 | Onboard 软键盘 |

**不要再依赖 Ctrl+Alt+F1/F2。**

---

## 七、运维小助手菜单说明

入口：

```Bash
microgrid-ops
# 或桌面图标 → qterminal -e microgrid-ops-term
```

| 序号 | 功能 | 是否拉远程镜像 |
|-|-|-|
| 1 | 本地启动容器 | 否 `compose up -d` |
| 2 | 停止容器 | 否 |
| 3 | 本地重启 | 否 |
| 4 | 查看状态 | — |
| 5 | 实时日志 | — |
| 6 | **远程更新** | **是** pull |
| 7 | 编辑 `.env.docker` | — |
| 8 | 清理 Docker 缓存 | — |
| 9 | 打开业务大屏 | — |
| 0 | 退出 | — |

---

## 八、端口与访问

| 端口 | 含义 |
|-|-|
| 宿主机 **80** | 前端；浏览器只打 80 |
| 容器内 8000 | 后端；由前端反代 `/api/*`，一般不对外开 8000 |

```Plaintext
浏览器 → http://工控机/api/... → frontend:3000 → backend:8000
```

演示模式：`.env.docker` 中 `DEMO_MODE=true`。  
真机串口：`DEMO_MODE=false` + udev 固定 `/dev/ttyPCS` `/dev/ttyENV`（见下文）。

---

## 九、串口（真机，可选）

```Bash
# 示例 udev（按实际 idVendor/idProduct 改）
cat > /etc/udev/rules.d/99-microgrid-serial.rules <<'EOF'
SUBSYSTEM=="tty", ATTRS{idVendor}=="xxxx", ATTRS{idProduct}=="xxxx", SYMLINK+="ttyPCS", MODE="0666"
SUBSYSTEM=="tty", ATTRS{idVendor}=="yyyy", ATTRS{idProduct}=="yyyy", SYMLINK+="ttyENV", MODE="0666"
EOF
udevadm control --reload-rules && udevadm trigger
```

compose 中取消 `devices:` 注释并绑定固定名；后端 `SERIAL_AUTO_DISCOVER=true` 支持热插拔重连。

---

## 十、开发机常用命令速查

```PowerShell
# SSH
ssh root@landa-ipc

# 同步脚本（注意 LF）
scp .\ops\terminal\debian-manager.sh root@landa-ipc:/opt/microgrid/ops/terminal/
ssh root@landa-ipc "sed -i 's/\r$//' /opt/microgrid/ops/terminal/*.sh"

# 看容器 / 日志
ssh root@landa-ipc "docker ps; journalctl -u microgrid-compose -n 30 --no-pager"

# 浏览器
start http://landa-ipc/
```

工控机本机：

```Bash
docker compose -f /opt/microgrid/docker-compose.remote.yml --env-file /opt/microgrid/.env.docker ps
systemctl status sddm microgrid-compose docker tailscaled --no-pager
microgrid-ops
```

---

## 十一、问题与答案全集（本轮踩坑）

| 问题 | 答案 |
|-|-|
| 开发机与工控机不同网段能否 SSH？ | **能**，走 Tailscale；不要死磕热点局域网 IP |
| 换手机热点要改 SSH 地址吗？ | **不用**，仍用 `landa-ipc` / 同一 `100.x.x.x` |
| `sudo: command not found` | 已是 root，直接执行命令 |
| `has no installation candidate` | 先配 `/etc/apt/sources.list` 再 `apt update` |
| `download.docker.com` SSL 重置 | 改用 Debian `docker.io` + 清华源 |
| `docker pull` 超时 | 配 `registry-mirrors` 后 `systemctl restart docker` |
| root 密码对仍 Permission denied | `PermitRootLogin yes` 或改用公钥 |
| `$'\r': command not found` | `sed -i 's/\r$//' *.sh`（Windows CRLF） |
| Tailscale offline | 先通网，再 `systemctl restart tailscaled` |
| `Network is unreachable` | USB 共享/DHCP/默认路由未好 |
| 画面只有左半边 | HDMI+DP 双输出；只留主屏或改 LXQt 单显 |
| Weston `--tty=` fatal | Weston 14 已移除该参数 |
| F1/F2 切终端黑屏 | DRM 占用；已改桌面模式，勿再用 |
| 运维助手闪退 / 序号无效 | 菜单被 `$()` 吞掉；已改为方向键菜单 + 「请输入序号」提示 |
| 启动容器很慢像在拉镜像 | 旧逻辑 `--pull always`；现本地启停不 pull |
| 开机黑屏很久 | compose 曾阻塞 graphical；已异步 + mask wait-online；BIOS 段需 Fast Boot |
| 谷歌翻译弹窗 | 用 `microgrid-chromium`（禁 Translate） |
| 需要 git 才能更新镜像吗？ | **不需要**，`docker compose pull` / 菜单「远程更新」即可 |
| 后端 8000 要开防火墙吗？ | **不需要**，走 80 的 `/api` |

---

## 十二、相关脚本清单（仓库）

| 脚本 | 用途 |
|-|-|
| `ops/terminal/setup-tailscale-ipc.sh` | Tailscale 安装接入 |
| `ops/terminal/docker-deploy.sh` | 拉取/部署 compose |
| `ops/terminal/debian-manager.sh` | 运维小助手（本地启停 / 远程更新） |
| `ops/terminal/setup-ipc-desktop.sh` | **LXQt 桌面终态一键安装** |
| `ops/terminal/fix-ipc-ops-autostart.sh` | 运维不闪退、大屏自启、compose 服务 |
| `ops/terminal/fix-ipc-menu-boot.sh` | 方向键菜单 + 开机加速 |
| `ops/terminal/microgrid-chromium.sh` | 禁翻译的大屏浏览器启动器 |
| `ops/terminal/setup-ipc-display-ops.sh` | 旧：Weston 单屏 Kiosk（历史） |
| `ops/terminal/setup-ipc-kiosk.sh` | 旧：cage/weston 调试（历史） |
| `docker-compose.remote.yml` | 工控机 compose |
| `.env.docker.example` | 环境变量模板 |

---

## 十三、推荐初始化顺序（新机照抄）

```Plaintext
1. 配清华 apt 源 + 能上网（USB 共享 / 热点 / 网线）
2. 装 OpenSSH；PermitRootLogin 或装开发机公钥
3. 装 Tailscale → hostname landa-ipc → 开发机 ssh root@landa-ipc
4. 装 docker.io + daemon.json registry-mirrors
5. /opt/microgrid：compose + .env.docker（DEMO_MODE）
6. docker login ghcr.io → compose pull && up -d
7. bash setup-ipc-desktop.sh → fix-ipc-ops-autostart.sh → fix-ipc-menu-boot.sh
8. 现场验证：桌面图标、运维菜单 ↑↓、大屏、重启后自启
9. （可选）真机串口 udev；BIOS 断电自启 + Fast Boot
10. 轮换曾在聊天中暴露的 PAT / 弱口令
```

---

## 十四、账号与安全提醒

| 用途 | 账号 | 说明 |
|-|-|-|
| SSH root | 曾用临时弱口令 | **务必改强密码或只保留密钥** |
| 桌面 | `ops` / `ops123` | 现场调试用，可改 |
| 业务大屏 | `admin` / `admin123` | 演示默认；上线请改 |
| ghcr | PAT | 勿入库；泄露后立即 revoke |

前端自动登录（`?auto=1`）、大屏清晰度（等比缩放接近 1 不糊）等需 **重建并拉取新前端镜像** 后完全生效；系统侧禁翻译与单屏/桌面已落地。

---

## 十五、验收清单

- [ ] ssh root@landa-ipc 稳定（换热点仍可）

- [ ] docker ps 见 backend/frontend healthy

- [ ] curl -I http://127.0.0.1/ → 200

- [ ] 开机进 LXQt，ops 自动登录

- [ ] 「运维小助手」可见完整菜单 +「请输入序号」，↑↓ 可用

- [ ] 本地启动不走 pull；远程更新才 pull

- [ ] 「业务大屏」可开，翻译弹窗可接受地少

- [ ] 重启后容器与桌面恢复；黑屏明显短于改之前

---

*本文档随 2026-07 工控机联调实操整理；*
