#!/usr/bin/env bash
# Debian / Ubuntu：安装 mihomo（Clash Meta）+ systemd + 7890 混合端口
# 用法:
#   sudo MIHOMO_SUB_URL='你的订阅链接' bash scripts/proxy/debian-mihomo-install.sh
#   sudo bash scripts/proxy/debian-mihomo-install.sh   # 稍后手动编辑 /etc/mihomo/env
set -euo pipefail

MIHOMO_VERSION="${MIHOMO_VERSION:-v1.19.12}"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
CONFIG_DIR="${CONFIG_DIR:-/etc/mihomo}"
DATA_DIR="${DATA_DIR:-/var/lib/mihomo}"
SERVICE_NAME="${SERVICE_NAME:-mihomo}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "请使用 root 运行: sudo bash $0" >&2
  exit 1
fi

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) ASSET="mihomo-linux-amd64-${MIHOMO_VERSION}.gz" ;;
  aarch64|arm64) ASSET="mihomo-linux-arm64-${MIHOMO_VERSION}.gz" ;;
  *)
    echo "不支持的架构: $ARCH" >&2
    exit 1
    ;;
esac

URL="https://github.com/MetaCubeX/mihomo/releases/download/${MIHOMO_VERSION}/${ASSET}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo ">> 下载 mihomo ${MIHOMO_VERSION} …"
curl -fsSL "$URL" -o "$TMP/mihomo.gz"
gzip -dc "$TMP/mihomo.gz" > "$TMP/mihomo"
install -m 755 "$TMP/mihomo" "$INSTALL_DIR/mihomo"

mkdir -p "$CONFIG_DIR" "$DATA_DIR/providers"
chmod 755 "$CONFIG_DIR" "$DATA_DIR"

if [[ ! -f "$CONFIG_DIR/config.yaml" ]]; then
  cp "$SCRIPT_DIR/mihomo-config.example.yaml" "$CONFIG_DIR/config.yaml"
fi

cat > "$CONFIG_DIR/env" <<'EOF'
# 订阅链接（Clash 格式）。填写后执行: sudo systemctl restart mihomo
MIHOMO_SUB_URL=
EOF

if [[ -n "${MIHOMO_SUB_URL:-}" ]]; then
  echo "MIHOMO_SUB_URL=${MIHOMO_SUB_URL}" > "$CONFIG_DIR/env"
  echo ">> 从订阅拉取配置 …"
  curl -fsSL "$MIHOMO_SUB_URL" -o "$CONFIG_DIR/config.yaml"
fi

cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=mihomo (Clash Meta) proxy
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
EnvironmentFile=-${CONFIG_DIR}/env
WorkingDirectory=${DATA_DIR}
ExecStartPre=/bin/mkdir -p ${DATA_DIR}/providers
ExecStart=${INSTALL_DIR}/mihomo -d ${CONFIG_DIR}
Restart=on-failure
RestartSec=5
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
EOF

cat > "$INSTALL_DIR/mihomo-refresh-sub" <<'EOS'
#!/usr/bin/env bash
set -euo pipefail
ENV_FILE="/etc/mihomo/env"
CONFIG="/etc/mihomo/config.yaml"
# shellcheck disable=SC1090
source "$ENV_FILE"
if [[ -z "${MIHOMO_SUB_URL:-}" ]]; then
  echo "请先在 $ENV_FILE 设置 MIHOMO_SUB_URL" >&2
  exit 1
fi
curl -fsSL "$MIHOMO_SUB_URL" -o "$CONFIG"
systemctl restart mihomo
echo "已更新订阅并重启 mihomo"
EOS
chmod 755 "$INSTALL_DIR/mihomo-refresh-sub"

cat > "$INSTALL_DIR/mihomo-proxy-env" <<'EOS'
#!/usr/bin/env bash
# 在当前 shell 启用代理: source /usr/local/bin/mihomo-proxy-env
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export HTTP_PROXY="$http_proxy"
export HTTPS_PROXY="$https_proxy"
export ALL_PROXY=socks5://127.0.0.1:7890
export no_proxy=localhost,127.0.0.1,::1
export NO_PROXY="$no_proxy"
echo "proxy -> 127.0.0.1:7890"
EOS
chmod 755 "$INSTALL_DIR/mihomo-proxy-env"

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

sleep 2
if curl -fsS --max-time 5 -x http://127.0.0.1:7890 http://www.gstatic.com/generate_204 >/dev/null 2>&1; then
  echo ">> 代理自检通过 (7890)"
else
  echo ">> 服务已启动，但代理自检未通过。请检查订阅是否在 ${CONFIG_DIR}/env 中配置正确。" >&2
  journalctl -u "$SERVICE_NAME" -n 20 --no-pager || true
fi

cat <<EOF

安装完成。

  状态:   systemctl status ${SERVICE_NAME}
  日志:   journalctl -u ${SERVICE_NAME} -f
  配置:   ${CONFIG_DIR}/config.yaml
  订阅:   编辑 ${CONFIG_DIR}/env → MIHOMO_SUB_URL=...
          然后: mihomo-refresh-sub

  本机启用代理:
    source /usr/local/bin/mihomo-proxy-env
    git push origin main

  HTTP/SOCKS 混合端口: 127.0.0.1:7890
  控制面板: 127.0.0.1:9090 (external-controller)

EOF
