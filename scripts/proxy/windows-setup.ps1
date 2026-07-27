# Windows: Clash Verge Rev + Git proxy helper
param(
  [int]$Port = 7890,
  [switch]$OpenDownload,
  [switch]$TestPush
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\my-blog"
if (-not (Test-Path "$repoRoot\.git")) {
  $repoRoot = git rev-parse --show-toplevel 2>$null
}
if (-not $repoRoot) {
  Write-Host "Run inside my-blog repo" -ForegroundColor Red
  exit 1
}

$downloadUrl = "https://github.com/clash-verge-rev/clash-verge-rev/releases/latest"

function Test-ProxyPort([int]$p) {
  try {
    $r = Test-NetConnection -ComputerName 127.0.0.1 -Port $p -WarningAction SilentlyContinue -ErrorAction Stop
    return [bool]$r.TcpTestSucceeded
  } catch {
    return $false
  }
}

Write-Host "=== Feiboxia Windows Proxy Setup ===" -ForegroundColor Cyan
Write-Host ""

if ($OpenDownload) {
  Write-Host "Opening Clash Verge Rev download page..." -ForegroundColor Yellow
  Start-Process $downloadUrl
}

Write-Host "Step 1: Install Clash Verge Rev from GitHub releases"
Write-Host "Step 2: Import Clash subscription, pick node, enable System Proxy or TUN"
Write-Host "Step 3: Confirm HTTP port in settings (default 7890)"
Write-Host ""

$portOk = Test-ProxyPort -p $Port
if ($portOk) {
  Write-Host "[OK] 127.0.0.1:$Port is listening" -ForegroundColor Green
} else {
  Write-Host "[!!] 127.0.0.1:$Port not listening - start Clash Verge Rev first" -ForegroundColor Red
}

Push-Location $repoRoot
try {
  & "$repoRoot\scripts\git-proxy.ps1" -Enable -Port $Port
} finally {
  Pop-Location
}

if ($portOk) {
  Write-Host ""
  Write-Host "Testing GitHub API via proxy..." -ForegroundColor Cyan
  try {
    $null = Invoke-WebRequest -Uri "https://api.github.com/zen" -Proxy "http://127.0.0.1:$Port" -TimeoutSec 15 -UseBasicParsing
    Write-Host "[OK] GitHub API reachable" -ForegroundColor Green
  } catch {
    Write-Host "[!!] GitHub API failed: $($_.Exception.Message)" -ForegroundColor Red
  }

  if ($TestPush) {
    Push-Location $repoRoot
    git push origin main
    Pop-Location
  } else {
    Write-Host ""
    Write-Host "Push: cd D:\my-blog; git push origin main"
    Write-Host "Or:  .\scripts\proxy\windows-setup.ps1 -Port $Port -TestPush"
  }
}

Write-Host ""
Write-Host "Done." -ForegroundColor Cyan
