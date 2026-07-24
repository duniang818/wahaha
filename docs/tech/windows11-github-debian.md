---
title: 完整部署实施命令文档
author: 渡娘
date: 2026-07-24
visibility: public
draft: false
feishu_doc: BKfcdE0LEotl9FxcxGqckflendg
feishu_url: https://my.feishu.cn/docx/BKfcdE0LEotl9FxcxGqckflendg
nav: 技术
platforms:
  - none
tags:
  - 技术
  - Debian
description: "<title完整部署实施命令文档（Windows11 → GitHub → Debian 工控机）</title 文档定位：从 Windows 宿主机到 Debian 触屏工控机的端到端一键部署，所有命令可直接复制执行。 目标环境：Wind…"
---
<title>完整部署实施命令文档（Windows11 → GitHub → Debian 工控机）</title>

> **文档定位**：从 Windows 宿主机到 Debian 触屏工控机的端到端一键部署，所有命令可直接复制执行。  
> **目标环境**：Windows 11 宿主机 + GitHub （ghcr.io） + Debian 12 工控机（键鼠、触屏软键盘）  
> **更新时间**：2026-07-20

---

目录

<readonly-block type="isv"></readonly-block>

# 架构总览

![](assets/windows11-github-debian/img-01.png)

**镜像清单**：

| 镜像 | 基础镜像 | 大小 | 用途 |
|-|-|-|-|
| `ghcr.io/duniang818/microgrid-backend:latest` | `debian:bookworm-slim` | 170MB | Rust actix-web 后端 |
| `ghcr.io/duniang818/microgrid-frontend:latest` | `node:20-slim` | 331MB | Next.js 前端（standalone） |

**端口规划**：前端 `80:3000`（统一入口），后端仅容器内网络访问。

---

# 云端私有仓库准备

> GitHub 私有代码库 + GHCR 镜像库关联配置步骤。
> 
> 适配架构：Windows11 开发机（Git+Docker Desktop）、Debian 工控机（Docker Engine 拉取 GHCR OCI 镜像），**私有仓库创建、PAT 凭证统一管理、Git 代码国内加速、GHCR 容器镜像国内加速**四大模块。

## GitHub 创建私有代码仓库（个人免费无数量限制）

1. 登录 GitHub 官网，右上角点击「+」→ **New repository**
2. 填写配置项：

   - Repository name：项目名称（工控业务项目名，仅英文/数字/横线）
   - Description：可选，填写工控微电网/容器业务说明
   - Visibility：**Private（私有）** 核心，外部无法访问源码
   - 初始化选项：
   
     - 已有本地代码：取消 `Initialize this repository with a README`
     - 全新项目：勾选 Add a README file，添加。gitignore（选 Rust/Docker 模板）
3. 点击 **Create repository** 完成创建
4. 仓库创建后复制 HTTPS 地址：

   ```Plain Text
   https://github.com/你的用户名/仓库名.git
   ```

> 私有仓库限制：免费个人账号最多邀请 3 位协作者；仅持有者+受邀人员可拉取/推送代码、访问 GHCR 镜像。

## 统一凭证：生成 GitHub PAT（代码+GHCR 镜像共用一套）

### 生成个人访问令牌 PAT

1. GitHub 右上角头像 → Settings → Developer settings → Personal access tokens → Tokens （classic）
2. Generate new token （classic），配置权限（必须勾选，否则私有仓库/镜像无权限）：

   - repo：全部勾选（私有代码读写）
   - write:packages、read:packages：GHCR 容器镜像推拉权限
   - delete:packages（可选，删除镜像）
3. 生成后**立即复制保存令牌**，页面刷新后无法再次查看。

```Markdown
ghp_开头的令牌
```

### Windows11 Git 绑定 PAT（拉取/推送私有代码）

克隆私有仓库时，用户名填 GitHub 账号，密码粘贴 PAT 令牌：

```Bash
# 克隆私有仓库
git clone https://github.com/用户名/私有仓库.git
# 弹出认证框：User=GitHub账号，Password=PAT令牌
```

永久缓存凭证（Windows Git Bash）：

```Bash
git config --global credential.helper wincred
```

### Windows Docker Desktop 绑定 PAT 推送 OCI 镜像至 GHCR

1. Docker Desktop 右上角头像 → Sign in
2. Registry: `ghcr.io`
3. Username：GitHub 用户名
4. Password：复制生成的 PAT 令牌

登录后可直接 `docker push ghcr.io/用户名/镜像名:tag`。

### Debian 工控机绑定 PAT 拉取私有 OCI 镜像

```Bash
# 登录GHCR，凭证复用同一PAT
docker login ghcr.io -u GitHub用户名
# 密码输入PAT令牌
# 拉取私有业务镜像
docker pull ghcr.io/用户名/工控业务镜像:v1.0
```

## Git 代码国内镜像源加速（Windows11 + Debian 通用）

推送和拉取首先都是直连，且推送仅直连，如果拉取时失败再走清华镜像源，再拉取失败走单次公共代理方案。

## GHCR（ghcr.io） OCI 镜像国内加速（分 Windows11、Debian 工控两套配置）

### 核心说明：

默认都直连GHCR，且推送不采用代理，如果直连拉取失败，走daocloud镜像代理。

ghcr.io 原生不兼容 Docker Hub 通用 mirror，需单独配置 ghcr 专属镜像代理，解决国内拉取 OCI 镜像超时、慢。

### Windows11 Docker Desktop 配置 GHCR 加速

1. 托盘 Docker 图标 → Settings → Docker Engine
2. 修改 JSON 配置，添加 ghcr 镜像代理：

```JSON
{
  "registry-mirrors": [
    "https://ghcr.nju.edu.cn",
    "https://docker.1ms.run"
  ]
}
```

1. Apply & Restart 重启 Docker 生效
2. 拉取私有镜像示例（自动走南大 GHCR 镜像加速）：

```Bash
docker pull ghcr.nju.edu.cn/你的用户名/业务镜像:v1.0
```

### Debian 工控机 Docker Engine 配置 GHCR 国内源（生产环境）

1. 创建/编辑 Docker 守护进程配置文件

```Bash
sudo nano /etc/docker/daemon.json
```

写入配置：

```JSON
{
  "registry-mirrors": [
    "https://ghcr.nju.edu.cn",
    "https://docker.xuanyuan.me"
  ]
}
```

1. 重载系统服务、重启 Docker

```Bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

1. 验证加速拉取私有 OCI 镜像

```Bash
# 登录GHCR（PAT凭证不变）
docker login ghcr.io -u GitHub用户名
# 加速拉取工控业务镜像
docker pull ghcr.nju.edu.cn/用户名/工控-app:latest
```

### containerd 底层加速（无 Docker、仅 nerdctl 场景备用）

编辑 `/etc/containerd/config.toml`，添加 ghcr 镜像端点：

```TOML
[plugins."io.containerd.grpc.v1.cri".registry.mirrors."ghcr.io"]
endpoint = ["https://gh-proxy.org/docker/ghcr.io"]
```

重启：`sudo systemctl restart containerd`

# Windows 宿主机环境准备

## 安装 Docker Desktop（命令行模式）

> 推荐使用 Docker Engine 命令行，不依赖 Docker Desktop GUI。

**方式 A：Docker Desktop（推荐，含 GUI 后台）**

```powershell
# 通过 winget 安装
winget install -e --id Docker.DockerDesktop

# 或下载离线包: https://docs.docker.com/desktop/install/windows-install/
# 启动 Docker Desktop 后在 Settings → General 取消勾选 "Use Docker Compose V2"，启用 BuildKit
```

**方式 B：纯命令行 Docker Engine（WSL2 后端）**

```powershell
# 启用 WSL2
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 下载并安装 WSL2 内核更新
Invoke-WebRequest -Uri "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi" -OutFile "$env:TEMP\wsl_update.msi"
Start-Process msiexec.exe -ArgumentList '/i', "$env:TEMP\wsl_update.msi", '/quiet' -Wait

# 设置 WSL 默认版本为 2
wsl --set-default-version 2
```

## 验证 Docker 安装

```powershell
# 验证 Docker 引擎
docker version

# 验证 BuildKit
docker buildx version

# 启用 BuildKit（推荐）
$env:DOCKER_BUILDKIT = 1
[Environment]::SetEnvironmentVariable("DOCKER_BUILDKIT", "1", "User")
```

## 安装 Git 并配置用户信息

```powershell
# 安装 Git
winget install -e --id Git.Git

# 配置全局用户信息
git config --global user.name "duniang818"
git config --global user.email "657192442@qq.com"

# 配置默认分支名为 master
git config --global init.defaultBranch master

# 启用长路径支持（Windows 必须）
git config --global core.longpaths true

# 配置行尾自动转换
git config --global core.autocrlf input

# 验证
git --version
git config --list --global
```

## 克隆项目代码

```powershell
# 切换到工作目录
cd D:\01-work\LanZhou

# 克隆仓库（如已存在跳过）
git clone https://github.com/duniang818/Rust_ZhongLian_6kW.git LanZhou_Microgrid
cd LanZhou_Microgrid

# 查看远程配置
git remote -v
```

## 宿主机构建 Debian Docker镜像并运行

### 切换到项目根目录

```powershell
cd D:\01-work\LanZhou\LanZhou_Microgrid

# 确认 Dockerfile 存在
Test-Path landa\backend_rust\Dockerfile
Test-Path landa\frontend_modern\Dockerfile
```

### 构建后端镜像（Rust + Debian）

```powershell
# 启用 BuildKit
$env:DOCKER_BUILDKIT = 1

# 构建后端镜像（多阶段：rust:1-slim-bookworm → debian:bookworm-slim）
docker build `
    -t ghcr.io/duniang818/microgrid-backend:latest `
    -t microgrid-backend:latest `
    -f landa/backend_rust/Dockerfile `
    .

# 验证镜像
docker images ghcr.io/duniang818/microgrid-backend:latest
```

**预期输出**：

```
REPOSITORY                                  TAG       SIZE
ghcr.io/duniang818/microgrid-backend        latest    170MB
```

### 构建前端镜像（Next.js standalone）

```powershell
# 构建前端镜像（含 NEXT_PUBLIC_DEMO_MODE 构建参数）
docker build `
    --build-arg NEXT_PUBLIC_DEMO_MODE=true `
    -t ghcr.io/duniang818/microgrid-frontend:latest `
    -t microgrid-frontend:latest `
    -f landa/frontend_modern/Dockerfile `
    .

# 验证镜像
docker images ghcr.io/duniang818/microgrid-frontend:latest
```

**预期输出**：

```
REPOSITORY                                   TAG       SIZE
ghcr.io/duniang818/microgrid-frontend        latest    331MB
```

### 使用一键构建脚本（推荐）

```powershell
# 使用 PowerShell 脚本一键构建
.\ops\terminal\docker-build-push.ps1 -Registry ghcr -Owner duniang818 -Tag latest

# 无缓存重新构建
.\ops\terminal\docker-build-push.ps1 -Registry ghcr -Owner duniang818 -Tag latest -NoCache
```

### 导出镜像为离线 tar 包（备用方案）

```powershell
# 创建 dist 目录
New-Item -ItemType Directory -Force -Path dist | Out-Null

# 导出镜像
docker save -o dist\microgrid-backend.tar ghcr.io/duniang818/microgrid-backend:latest
docker save -o dist\microgrid-frontend.tar ghcr.io/duniang818/microgrid-frontend:latest

# 验证 tar 包
Get-ChildItem dist\*.tar | Select-Object Name, @{N='SizeMB';E={[math]::Round($_.Length/1MB, 1)}}
```

## 推送代码与镜像到 GitHub

### 提交代码变更

```powershell
cd D:\01-work\LanZhou\LanZhou_Microgrid

# 查看变更
git status

# 暂存核心代码变更
git add landa/backend_rust/
git add landa/frontend_modern/
git add ops/terminal/
git add tools/frontend-scripts/
git add docker-compose.yml docker-compose.remote.yml

# 提交
git commit -m "feat: 双 PCS 系统扩展 + Docker 镜像构建优化"
```

### 推送代码到 GitHub

```powershell
# 推送到 origin master 分支
git push origin master

# 或推送到 real 分支（生产分支）
git push origin real
```

### 登录 GitHub Container Registry

```powershell
# 使用 PAT 登录 ghcr.io（stdin 安全方式）
$env:CR_PAT = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
$env:CR_PAT | docker login ghcr.io -u duniang818 --password-stdin
Remove-Item Env:CR_PAT

# 验证登录
docker info | Select-String "Username"
```

### 推送镜像到 ghcr.io

```powershell
# 推送后端镜像
docker push ghcr.io/duniang818/microgrid-backend:latest

# 推送前端镜像
docker push ghcr.io/duniang818/microgrid-frontend:latest
```

### 一键构建并推送（使用脚本）

```powershell
# 构建并推送
.\ops\terminal\docker-build-push.ps1 -Registry ghcr -Owner duniang818 -Tag latest -Push

# 验证推送结果
$pat = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
curl.exe -s -H "Authorization: token $pat" "https://api.github.com/users/duniang818/packages?package_type=container" | Select-String "name|visibility|html_url"
```

### 设置镜像可见性（可选）

```powershell
# 默认 private，工控机拉取需登录。如需 public 免认证拉取：
# 访问 https://github.com/users/duniang818/packages/container/microgrid-backend/settings
# Danger Zone → Change visibility → Public

# 或通过 API 修改
$pat = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
curl.exe -X PATCH `
    -H "Authorization: token $pat" `
    -H "Accept: application/vnd.github+json" `
    https://api.github.com/user/packages/container/microgrid-backend `
    -d '{"visibility":"public"}'
```

---

## 宿主机本地运行 Docker 镜像

### 使用 docker-compose 启动（宿主机本地构建镜像）

```powershell
cd D:\01-work\LanZhou\LanZhou_Microgrid

# 启动服务（使用本地构建的镜像）
docker compose up -d

# 查看容器状态
docker compose ps

# 查看实时日志
docker compose logs -f
```

### 使用远程镜像启动（拉取 ghcr.io 镜像）

```powershell
cd D:\01-work\LanZhou\LanZhou_Microgrid

# 拉取并启动（使用 docker-compose.remote.yml）
docker compose -f docker-compose.remote.yml pull
docker compose -f docker-compose.remote.yml up -d

# 查看状态
docker compose -f docker-compose.remote.yml ps
```

### 验证服务可用性

```powershell
# 等待服务就绪（健康检查）
Start-Sleep -Seconds 15

# 测试后端 API
curl.exe http://localhost:8000/api/health
# 或通过前端代理
curl.exe http://localhost/api/health

# 测试前端页面
curl.exe -I http://localhost
```

### 自动打开浏览器访问

```powershell
# 默认浏览器打开应用
Start-Process "http://localhost"

# 或指定浏览器
Start-Process "msedge" "http://localhost"
Start-Process "chrome" "http://localhost"
```

### 停止与清理

```powershell
# 停止服务
docker compose down

# 停止并删除数据卷（清空数据库）
docker compose down -v

# 清理悬空镜像
docker image prune -f
```

---

# U盘制作Debian系统并安装启动

##  下载 Debian ISO，13.6.0稳定版

<bookmark name="Download Debian" href="https://www.debian.org/distrib/"></bookmark>

## 下载Rufus制作U盘启动：[https://rufus.ie/zh/](https://rufus.ie/zh/)

Rufus 是免费开源工具，官网下载后只需三步即可制作启动盘，支持 Windows 和 Linux 系统 。 制作前务必备份 U 盘数据，因为过程会清空所有内容。

🛠️ 下载与准备工作

1. 获取软件：访问 Rufus 官网（rufus.ie）下载最新便携版，无需安装，双击即可运行 。
2. 准备镜像：提前下载好系统 ISO 文件（如  Debian ISO，13.6.0 发行版），或直接在软件内在线获取 。
3. 插入 U 盘：将 U 盘插入电脑，确保容量足够（建议 8GB 以上），并记住盘符以防选错 。

⚙️ 参数配置与制作

1. 选择设备与镜像：在“设备”栏确认 U 盘，点击“选择”导入 ISO 文件 。
2. 设置分区方案：

   - 新电脑（UEFI 启动）：分区方案选GPT，目标系统选UEFI，文件系统推荐NTFS。
   - 旧电脑（传统 BIOS）：分区方案选MBR，目标系统选BIOS 或 UFI。
3. 开始写入：点击“开始”，等待进度条完成即可 。

![](assets/windows11-github-debian/img-02.png)

## 从U盘安装 Debian

```powershell
# 1. 重启电脑，按 Del 进入 BIOS
# 2. 设置 U 盘为第一启动项
# 3. 保存并重启

# 4. 选择 "Graphical Install"（图形安装）
# 5. 语言选择中文（简体）
# 6. 区域选择中国
# 7. 键盘布局选择 American English
# 8. 主机名: 取名
# 9. 域名: 留空
# 10. Root 密码: 设置强密码
# 11. 新用户: 用户名/ 设置密码
# 12. 磁盘分区: 选择"使用最大连续空闲空间"（自动使用步骤 7.4 腾出的空间）
# 13. 软件选择: 仅勾选 "SSH server" 和 "standard system utilities"（最小化安装）
# 14. GRUB 引导器: 安装到主磁盘 (/dev/sda 或 /dev/nvme0n1)
# 15. 完成安装，重启
```

![](assets/windows11-github-debian/img-03.png)

![](assets/windows11-github-debian/img-04.png)

界面：Aptio Setup - AMI（UEFI 图形化 BIOS，不是老式纯黑白 Legacy） ✅ 已经识别 U 盘：`KingstonDataTraveler 3.0PMAP` ✅ USB 相关参数当前状态（全部配置正确）

- Legacy USB Support: Enabled
- XHCI Hand-off: Enabled  XHCI 切换：已启用
- USB Mass Storage Driver Support: Enabled  
USB 大容量存储设备驱动程序支持：已启用

> 当前页面是【Advanced → USB Configuration】，这里不能设置启动顺序，需要切换到 Boot 菜单。

---

## 完整操作步骤（安装 Debian13）

### 返回 BIOS 主界面

按 `ESC` 退出当前 USB 配置页面，回到顶层菜单。

### 切换到【Boot】选项卡

找到这些关键项优先设置：

1. Secure Boot → `Disabled` ⚠️【必关，否则 Linux 无法引导】
2. Boot Mode（启动模式） → `UEFI Only`（Debian 推荐 UEFI 启动）
3. 找到 `Boot Option Priorities`（启动优先级） 

   - `Boot Option #1`：选择 `UEFI: KingstonDataTraveler 3.0PMAP`
   - `Boot Option #2`：设置为本机 SATA 硬盘

💡 如果列表同时出现 UEFI 和非 UEFI 的 U 盘选项，一定要选带 UEFI 前缀的条目。

### 临时启动菜单备选（不用永久修改顺序）

重启开机时快速按 F11（这款 Aptio 标准快捷键），直接弹出一次性启动菜单，选中 U 盘启动，安装系统后自动恢复原有启动顺序。

### 保存退出

设置完成后按 `F4`（界面右下角标注：Save & Exit），确认保存重启。

### 关键前置检查（必须先切到 Security 标签）

1. 顶部切换到 Security 菜单
2. 找到 Secure Boot → 设置为 `Disabled`

> 不关闭 Secure Boot，Debian 安装介质无法正常引导启动！

### 保存重启

全部设置完成，按下键盘 F4，选择 Yes 保存更改并重启，工控机会优先从 U 盘启动 Debian 安装程序。

![](assets/windows11-github-debian/img-05.png)

直接选中任意网卡（推荐 `eno1`）回车

接下来出现网络配置页面时，选择【不配置网络】

向导 - 使用整个磁盘并配置 LVM【工业工控首选】 LVM 逻辑卷，后期支持：在线扩容根分区、新增数据卷、快照备份。 你的场景：运行 Docker 容器、持续存储业务日志，优先选这个。

两块磁盘：

1. sda：256.1GB Lexar SSD（工控机内置固态硬盘，系统目标盘 ✅）
2. sdb：62.8GB U 盘（安装介质，绝对不要选！）

### 标准操作步骤

1. 先用上下箭头，确认光标在列表区域；
2. 确认【标准系统工具】√ 已勾选；
3. 按下 Tab 键，光标会跳转到界面下方隐藏的【<继续>】按钮；
4. 光标选中 `<继续>` 之后，再按 Enter 进入下一步。

界面提示：`debian login:`

![](assets/windows11-github-debian/img-06.png)

```Markdown
切换root账户关机：
su - root
poweroff  
```

# Debian 无头安装后基础配置

<figure view-type="Preview"><source href="https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MWM4OTVlN2EyMWYyMzNiOWE1ODJmNzZkZjQ1ODYxMGJfNDgxMTUzMWJhYjU0Y2ZmYzZkZDJmZDI3MDYwYjhjYWZfSUQ6NzY2NTk3MDMwODU1MzQ5MzQ2N18xNzg0ODc1MDYxOjE3ODQ4Nzg2NjFfVjM" token="FSxgbGCAWoy5PbxILLBctO9Hns9"/></figure>

# 附录：故障排查与维护命令

## 常用维护命令

```powershell
# === Windows 宿主机 ===

# 查看所有镜像
docker images

# 查看运行容器
docker ps

# 进入容器调试
docker exec -it microgrid-backend bash
docker exec -it microgrid-frontend sh

# 查看容器日志
docker logs -f microgrid-backend --tail 100
docker logs -f microgrid-frontend --tail 100

# 清理无用镜像和容器
docker system prune -af

# 查看磁盘占用
docker system df
```

```bash
# === Debian 工控机 ===

# 查看服务状态
sudo systemctl status docker
sudo systemctl status microgrid-deploy

# 重启服务
sudo systemctl restart docker
docker compose -f /opt/microgrid/docker-compose.remote.yml restart

# 更新镜像
cd /opt/microgrid
docker compose -f docker-compose.remote.yml pull
docker compose -f docker-compose.remote.yml up -d

# 查看实时资源占用
docker stats

# 查看磁盘空间
df -h
docker system df
```

## 故障排查

### Q1: Docker 镜像构建失败 `assert-no-google-fonts.mjs` 找不到 src 目录

```powershell
# 原因：Dockerfile WORKDIR 与脚本路径不匹配
# 解决：确保 Dockerfile 中 WORKDIR 为 /landa/frontend_modern
# 验证 Dockerfile 内容
Get-Content landa\frontend_modern\Dockerfile | Select-String "WORKDIR"
# 应输出: WORKDIR /landa/frontend_modern
```

### Q2: 后端构建失败 `edition2024 is unstable`

```powershell
# 原因：Rust 版本过旧
# 解决：Dockerfile 使用 rust:1-slim-bookworm（最新 stable）
# 验证 Dockerfile 内容
Get-Content landa\backend_rust\Dockerfile | Select-String "FROM rust"
# 应输出: FROM rust:1-slim-bookworm AS builder
```

### Q3: 后端构建失败 libudev-sys build failed

```powershell
# 原因：缺少 libudev-dev 系统依赖
# 解决：Dockerfile 已添加 libudev-dev 到 apt 安装列表
Get-Content landa\backend_rust\Dockerfile | Select-String "libudev"
# 应输出: pkg-config libssl-dev libsqlite3-dev libudev-dev
```

### Q4: GitHub 推送失败 Connection was reset

```powershell
# 原因：GFW 阻断 github.com:443
# 解决 A：配置代理
git config --global http.proxy http://127.0.0.1:5780
git config --global https.proxy http://127.0.0.1:5780

# 解决 B：使用镜像
git remote set-url origin https://ghproxy.com/https://github.com/duniang818/Rust_ZhongLian_6kW.git

# 测试连接
Test-NetConnection github.com -Port 443
```

### Q5: ghcr.io 推送失败 permission_denied

```powershell
# 原因：PAT 缺少 write:packages 权限
# 解决：重新生成 classic PAT，勾选 write:packages
# 验证 PAT 权限
$pat = "ghp_xxxxxxxxxxxx"
curl.exe -sI -H "Authorization: token $pat" https://api.github.com/user | Select-String "X-OAuth-Scopes"
```

### Q6: 工控机拉取镜像失败 denied

```bash
# 原因：未登录 ghcr.io 或 PAT 权限不足
echo "ghp_xxxxxxxxxxxx" | docker login ghcr.io -u duniang818 --password-stdin

# 验证登录
cat ~/.docker/config.json | grep -A2 ghcr.io
```

### Q7: Kiosk 模式 Chromium 未启动

```bash
# 检查 autostart 配置
ls -la /home/kiosk/.config/autostart/
cat /home/kiosk/.config/autostart/kiosk-browser.desktop

# 手动启动测试
sudo -u kiosk DISPLAY=:0 chromium --kiosk http://localhost:80 &

# 检查 GDM 自动登录
cat /etc/gdm3/daemon.conf
```

### Q8: 软键盘未自动弹出

```bash
# 检查 onboard 进程
ps aux | grep onboard

# 手动启动
sudo -u kiosk DISPLAY=:0 onboard &

# 检查配置
cat /home/kiosk/.config/onboard/onboard.config

# 启用 auto-show
sudo -u kiosk gsettings set org.onboard auto-show true
```

## 6.3 配置文件参考

| 文件路径 | 用途 |
|-|-|
| `landa/backend_rust/Dockerfile` | 后端镜像构建配置 |
| `landa/frontend_modern/Dockerfile` | 前端镜像构建配置 |
| `docker-compose.yml` | 本地构建部署编排 |
| `docker-compose.remote.yml` | 远程镜像部署编排 |
| `ops/terminal/docker-deploy.sh` | Debian 一键部署脚本 |
| `ops/terminal/kiosk-setup.sh` | Kiosk 一键配置脚本 |
| `ops/terminal/docker-build-push.ps1` | PC 端构建推送脚本 |
| `ops/terminal/platform.env.example` | 环境变量模板 |
| `/etc/gdm3/daemon.conf` | GDM 自动登录配置 |
| `/etc/udev/rules.d/99-microgrid-serial.rules` | 串口设备固定规则 |
| `/etc/systemd/system/microgrid-deploy.service` | 开机自启服务 |

## 6.4 端口与连接速查

| 服务 | 端口 | 访问方式 |
|-|-|-|
| 前端 Web | 80 | `http://localhost` 或 `http://<工控机IP>` |
| 后端 API（容器内） | 8000 | 仅通过前端代理访问 `http://localhost/api/*` |
| SSH | 22 | `ssh kiosk@<工控机IP>` |
