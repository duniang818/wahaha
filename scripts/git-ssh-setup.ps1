# 生成 SSH 密钥并将本仓库 remote 改为 SSH（需先在 GitHub 添加公钥）
# 用法: .\scripts\git-ssh-setup.ps1
#       .\scripts\git-ssh-setup.ps1 -Email "you@example.com"

param(
  [string]$Email = "duniang818@users.noreply.github.com"
)

$sshDir = Join-Path $env:USERPROFILE ".ssh"
$key = Join-Path $sshDir "id_ed25519"
$pub = "$key.pub"

if (-not (Test-Path $sshDir)) {
  New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

if (-not (Test-Path $key)) {
  Write-Host "生成 SSH 密钥…" -ForegroundColor Cyan
  ssh-keygen -t ed25519 -C $Email -f $key -N '""'
} else {
  Write-Host "已存在密钥: $key" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 公钥（复制到 GitHub → Settings → SSH and GPG keys → New SSH key）===" -ForegroundColor Green
Get-Content $pub
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (Test-Path (Join-Path (Get-Location) ".git")) {
  $repoRoot = Get-Location
} elseif (Test-Path "D:\my-blog\.git") {
  $repoRoot = "D:\my-blog"
}

Push-Location $repoRoot
try {
  git remote set-url origin git@github.com:duniang818/wahaha.git
  Write-Host "已将 origin 改为 SSH:" -ForegroundColor Green
  git remote -v
  Write-Host ""
  Write-Host "测试连接: ssh -T git@github.com" -ForegroundColor Cyan
  Write-Host "推送:     git push origin main" -ForegroundColor Cyan
} finally {
  Pop-Location
}
