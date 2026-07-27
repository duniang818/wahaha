# 跨平台代理实施（Clash Verge Rev + mihomo）

博客 CDN（`gcore.jsdelivr.net`）只加速 **访客打开 Pages**；**git push** 需本机代理。

## Windows（开发机）

1. 下载安装 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases/latest)
2. 导入你的 **Clash 格式订阅** → 选节点 → 开启 **系统代理** 或 **TUN**
3. 在仓库运行：

```powershell
cd D:\my-blog
.\scripts\proxy\windows-setup.ps1 -OpenDownload   # 可选：打开下载页
.\scripts\proxy\windows-setup.ps1 -Port 7890      # 检测端口 + 配置 Git 代理
git push origin main
```

常用命令：

```powershell
.\scripts\git-proxy.ps1 -Status
.\scripts\git-proxy.ps1 -Disable
.\scripts\proxy\windows-setup.ps1 -Port 7890 -TestPush
```

## Debian（服务器 / 工控机）

```bash
cd /path/to/my-blog   # 或 scp 本脚本到服务器
sudo MIHOMO_SUB_URL='你的Clash订阅URL' bash scripts/proxy/debian-mihomo-install.sh
```

安装后：

```bash
source /usr/local/bin/mihomo-proxy-env
git push origin main
curl -I https://github.com
```

更新订阅：

```bash
sudo nano /etc/mihomo/env          # MIHOMO_SUB_URL=...
sudo mihomo-refresh-sub
```

服务管理：

```bash
systemctl status mihomo
journalctl -u mihomo -f
```

默认 **混合端口 7890**，与 Windows Git 代理一致。

## SSH 备选（长期）

```powershell
cd D:\my-blog
.\scripts\git-ssh-setup.ps1
# 公钥添加到 GitHub → Settings → SSH keys
```

## 文件一览

| 文件 | 用途 |
|------|------|
| `scripts/proxy/windows-setup.ps1` | Windows 检测 + Git 代理 |
| `scripts/proxy/debian-mihomo-install.sh` | Debian 安装 mihomo |
| `scripts/proxy/mihomo-config.example.yaml` | 配置模板 |
| `scripts/git-proxy.ps1` | Git 代理开关 |
| `scripts/git-ssh-setup.ps1` | SSH 远程地址 |
