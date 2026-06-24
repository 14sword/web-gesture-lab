#!/bin/bash
# 水墨手势 // Ink Gesture Launcher
# ----------------------------------------------------
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "====== 水墨手势 // Web Gesture Lab ======"

# 1. 检查并运行依赖下载 (MediaPipe)
if [ ! -d "lib" ] || [ ! -f "lib/hands_solution_wasm_bin.wasm" ]; then
    echo "[...] 首次运行或依赖缺失：正在下载 MediaPipe 离线模型资源 (约 24MB)..."
    python3 -c "import ssl; ssl.create_default_context = ssl._create_unverified_context; import setup; setup.DOWNLOADS = [(url.replace('hands_solution_packed_assets_bin.wasm', 'hands_solution_wasm_bin.wasm'), path.replace('hands_solution_packed_assets_bin.wasm', 'hands_solution_wasm_bin.wasm')) for url, path in setup.DOWNLOADS]; [setup.download(url, path) for url, path in setup.DOWNLOADS]"
else
    echo "[✓] 检测到 MediaPipe 依赖模型库已在 lib/ 目录下就绪。"
fi

# 2. 建立本地依赖路径映射以支持离线/本地加载 (避开 CDN)
if [ -d "lib" ] && [ ! -d "lib/@mediapipe" ]; then
    echo "[...] 正在建立本地依赖路径映射..."
    mkdir -p "lib/@mediapipe/hands@0.4.1675469240"
    mkdir -p "lib/@mediapipe/camera_utils@0.3.1675466862"
    
    # 使用相对软链接映射文件到 gesture.js 预期的目录结构
    ln -sf ../../hands.js "lib/@mediapipe/hands@0.4.1675469240/hands.js"
    ln -sf ../../hands_solution_packed_assets_loader.js "lib/@mediapipe/hands@0.4.1675469240/hands_solution_packed_assets_loader.js"
    ln -sf ../../hands_solution_packed_assets.data "lib/@mediapipe/hands@0.4.1675469240/hands_solution_packed_assets.data"
    ln -sf ../../hands_solution_simd_wasm_bin.wasm "lib/@mediapipe/hands@0.4.1675469240/hands_solution_simd_wasm_bin.wasm"
    ln -sf ../../hands_solution_wasm_bin.wasm "lib/@mediapipe/hands@0.4.1675469240/hands_solution_wasm_bin.wasm"
    
    ln -sf ../../camera_utils.js "lib/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js"
    echo "[✓] 依赖路径映射创建成功。"
fi

# 3. 检查 8000 端口并拉起 HTTP 服务
PORT=8000
nc -z localhost $PORT >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "[✓] 检测到本地 Web 服务已在运行。"
else
    echo "[...] 正在启动本地 HTTP 服务..."
    # 启动后台 python 简易 HTTP 服务
    python3 -m http.server $PORT --bind 127.0.0.1 > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 1
fi

# 4. 自动打开浏览器
echo "[...] 正在浏览器中加载交互页面..."
if command -v open &> /dev/null; then
    open "http://localhost:$PORT/index.html"
else
    echo "请手动在浏览器中访问: http://localhost:$PORT/index.html"
fi

# 5. 退出清理
if [ ! -z "$SERVER_PID" ]; then
    echo ""
    read -p "是否终止本地运行的 HTTP 服务进程？(Y/n): " stop_server
    if [[ "$stop_server" =~ ^[Yy]*$ ]] || [ -z "$stop_server" ]; then
        kill $SERVER_PID
        echo "[✓] 服务已安全关闭。"
    fi
fi
