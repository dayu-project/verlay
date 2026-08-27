$ErrorActionPreference = "Stop"

$KitDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RuntimeDir = Join-Path $KitDir ".verlay-runtime"
$Helper = Get-ChildItem (Join-Path $KitDir "本地助手") -Filter "*.tgz" | Select-Object -First 1

Write-Host ""
Write-Host "映证 Verlay 测试环境本地助手"
Write-Host "=============================="

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "未检测到 Node.js。请先安装 Node.js 22 或更高版本：https://nodejs.org/"
  Read-Host "按回车退出"
  exit 1
}

$NodeMajor = [int]((& node -p "Number(process.versions.node.split('.')[0])").Trim())
if ($NodeMajor -lt 22) {
  Write-Host "当前 Node.js 版本过低，需要 Node.js 22 或更高版本。"
  Read-Host "按回车退出"
  exit 1
}

if (-not $Helper) {
  Write-Host "安装包不完整：未找到本地助手 tgz。"
  Read-Host "按回车退出"
  exit 1
}

$Airship = Join-Path $RuntimeDir "node_modules\.bin\airship.cmd"
if (-not (Test-Path $Airship)) {
  Write-Host "首次运行，正在安装映证本地助手依赖..."
  & npm.cmd install --no-audit --no-fund --prefix $RuntimeDir $Helper.FullName
}

$TargetPort = Read-Host "请输入当前测试 Web 端口（例如 8080）"
if ($TargetPort -notmatch "^\d+$") {
  Write-Host "端口格式不正确。"
  Read-Host "按回车退出"
  exit 1
}

$RepoPath = Read-Host "请输入测试 Web 的本地代码仓库绝对路径"
if (-not (Test-Path -PathType Container $RepoPath)) {
  Write-Host "目录不存在：$RepoPath"
  Read-Host "按回车退出"
  exit 1
}

Write-Host ""
Write-Host "正在启动映证服务：http://127.0.0.1:5175"
Write-Host "启动后回到 Chrome，在测试 Web 页面点击映证扩展图标。"
Write-Host "按 Control-C 可停止服务。"
Write-Host ""

& $Airship --target $TargetPort --port 5175 --cwd $RepoPath --agent codex --safe
