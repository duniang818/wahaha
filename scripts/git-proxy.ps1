# Git proxy toggle (repo-local by default; add -Global for all repos)
param(
  [switch]$Enable,
  [switch]$Disable,
  [switch]$Status,
  [switch]$Global,
  [int]$Port = 7890
)

$proxy = "http://127.0.0.1:$Port"
$scope = if ($Global) { "--global" } else { "--local" }

function Show-Status {
  Write-Host "=== Git proxy status ===" -ForegroundColor Cyan
  Write-Host "Global http.proxy:  $(git config --global --get http.proxy 2>$null)"
  Write-Host "Global https.proxy: $(git config --global --get https.proxy 2>$null)"
  Write-Host "Local  http.proxy:  $(git config --local --get http.proxy 2>$null)"
  Write-Host "Local  https.proxy: $(git config --local --get https.proxy 2>$null)"
}

if ($Status) { Show-Status; exit 0 }

if ($Disable) {
  git config $scope --unset http.proxy 2>$null
  git config $scope --unset https.proxy 2>$null
  Write-Host "Git proxy disabled ($scope)" -ForegroundColor Green
  Show-Status
  exit 0
}

if ($Enable) {
  git config $scope http.proxy $proxy
  git config $scope https.proxy $proxy
  Write-Host "Git proxy enabled: $proxy ($scope)" -ForegroundColor Green
  Write-Host "Ensure Clash/V2Ray is running on port $Port" -ForegroundColor Yellow
  Show-Status
  exit 0
}

Write-Host "Usage:"
Write-Host "  .\scripts\git-proxy.ps1 -Enable -Port 7890"
Write-Host "  .\scripts\git-proxy.ps1 -Disable"
Write-Host "  .\scripts\git-proxy.ps1 -Status"
Write-Host "Common ports: Clash 7890, Clash Verge 7897, V2RayN 10809"
