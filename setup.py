#!/usr/bin/env python3
"""
水墨手势 — 一键安装脚本
运行: python3 setup.py
自动下载 MediaPipe 所需文件并启动本地服务器
"""
import os, sys, urllib.request, ssl, http.server, threading

BASE = os.path.dirname(os.path.abspath(__file__))
LIB  = os.path.join(BASE, 'lib')

# 需要下载的文件列表: (远程URL, 本地相对路径)
VERSION_HANDS    = '0.4.1675469240'
VERSION_CAMERA   = '0.3.1675466862'
CDN              = 'https://cdn.jsdelivr.net/npm'

DOWNLOADS = [
    # Hands 核心JS
    (f'{CDN}/@mediapipe/hands@{VERSION_HANDS}/hands.js',                f'lib/hands.js'),
    # Camera utils JS
    (f'{CDN}/@mediapipe/camera_utils@{VERSION_CAMERA}/camera_utils.js', f'lib/camera_utils.js'),
    # Hands WASM 加载器及资源（约24MB，耐心等待）
    (f'{CDN}/@mediapipe/hands@{VERSION_HANDS}/hands_solution_packed_assets_loader.js', 'lib/hands_solution_packed_assets_loader.js'),
    (f'{CDN}/@mediapipe/hands@{VERSION_HANDS}/hands_solution_packed_assets.data',      'lib/hands_solution_packed_assets.data'),
    (f'{CDN}/@mediapipe/hands@{VERSION_HANDS}/hands_solution_simd_wasm_bin.wasm',      'lib/hands_solution_simd_wasm_bin.wasm'),
    (f'{CDN}/@mediapipe/hands@{VERSION_HANDS}/hands_solution_packed_assets_bin.wasm',  'lib/hands_solution_packed_assets_bin.wasm'),
]

def download(url, rel_path):
    dest = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest) and os.path.getsize(dest) > 100:
        print(f'  [跳过] {rel_path} (已存在)')
        return True
    print(f'  [下载] {rel_path} ...', end=' ', flush=True)
    try:
        ctx = ssl.create_default_context()
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
            data = resp.read()
            with open(dest, 'wb') as f:
                f.write(data)
        print(f'OK ({len(data)//1024}KB)')
        return True
    except Exception as e:
        print(f'失败: {e}')
        return False

def main():
    print('=' * 50)
    print('  水墨手势 — 一键安装')
    print('=' * 50)

    # Step 1: 下载文件
    print(f'\n[1/2] 下载 MediaPipe 文件到 {LIB}/\n')
    all_ok = True
    for url, path in DOWNLOADS:
        if not download(url, path):
            all_ok = False

    if not all_ok:
        print('\n部分文件下载失败，请检查网络后重试。')
        print('如在中国大陆，可尝试使用VPN或更换网络。')
        sys.exit(1)

    # Step 2: 确认 HTML 文件
    html_src = os.path.join(BASE, 'app.html')
    if not os.path.exists(html_src):
        print('\n[警告] 未能在当前目录下找到 app.html 文件！')

    # Step 3: 启动本地服务器
    print(f'\n[2/2] 启动本地服务器...\n')
    os.chdir(BASE)
    PORT = 8000
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.HTTPServer(('127.0.0.1', PORT), handler)

    print(f'  ✓ 服务器已启动')
    print(f'  ✓ 请在浏览器中打开: http://localhost:{PORT}/index.html')
    print(f'  ✓ 按 Ctrl+C 停止服务器\n')

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n服务器已停止。')
        httpd.server_close()

if __name__ == '__main__':
    main()
