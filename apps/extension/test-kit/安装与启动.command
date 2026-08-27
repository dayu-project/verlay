#!/bin/zsh
set -e

kit_dir="${0:A:h}"
runtime_dir="$kit_dir/.verlay-runtime"
helper_tgz=("$kit_dir"/本地助手/*.tgz(N))

echo ""
echo "映证 Verlay 测试环境本地助手"
echo "=============================="

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js。请先安装 Node.js 22 或更高版本。"
  echo "https://nodejs.org/"
  read "reply?按回车退出..."
  exit 1
fi

node_major=$(node -p "Number(process.versions.node.split('.')[0])")
if (( node_major < 22 )); then
  echo "当前 Node.js 版本过低：$(node -v)。需要 Node.js 22 或更高版本。"
  read "reply?按回车退出..."
  exit 1
fi

if (( ${#helper_tgz[@]} == 0 )); then
  echo "安装包不完整：未找到本地助手 tgz。"
  read "reply?按回车退出..."
  exit 1
fi

if [[ ! -x "$runtime_dir/node_modules/.bin/airship" ]]; then
  echo "首次运行，正在安装映证本地助手依赖..."
  npm install --no-audit --no-fund --prefix "$runtime_dir" "${helper_tgz[1]}"
fi

read "target_port?请输入当前测试 Web 端口（例如 8080）："
if ! [[ "$target_port" == <-> ]]; then
  echo "端口格式不正确。"
  read "reply?按回车退出..."
  exit 1
fi

read "repo_path?请输入测试 Web 的本地代码仓库绝对路径："
repo_path="${repo_path/#\~/$HOME}"
if [[ ! -d "$repo_path" ]]; then
  echo "目录不存在：$repo_path"
  read "reply?按回车退出..."
  exit 1
fi

echo ""
echo "正在启动映证服务：http://127.0.0.1:5175"
echo "启动后回到 Chrome，在测试 Web 页面点击映证扩展图标。"
echo "按 Control-C 可停止服务。"
echo ""

exec "$runtime_dir/node_modules/.bin/airship" \
  --target "$target_port" \
  --port 5175 \
  --cwd "$repo_path" \
  --agent codex \
  --safe
