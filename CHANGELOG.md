# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to Semantic Versioning.

## [1.0.0] - 2026-06-14

### Added
- **纯摄像头手势模式 (Pure Camera Input)**：全新改版，移除所有键盘与鼠标事件模拟，手势控制成为场景唯一输入源。
- **动态手势 HUD 状态栏**：自适应手势触发状态提示，支持中文和 Emoji 标记。
- **多端设备自适应 (Cross-Platform Optimization)**：
  - 移动端自动优化并降级摄像头采集分辨率（`320x240`）与 MediaPipe 追踪复杂度 (`modelComplexity: 0`)，极大减少电量消耗和延迟。
  - 移动端竖屏横置遮罩提示层（Portrait Orientation Warning Overlay）。
- **音频交互自适应**：切换视图时自动重置及播放匹配音轨，新增音乐按钮（44px 大尺寸触摸热区）实现音乐一键开关。
- **极强网络加载容错**：摄像头初始化如果检测不到 MediaPipe 的 `Camera` 类辅助工具，会自动 fallback 到原生 `requestAnimationFrame` 视频流检测循环，防止 CDN 部分挂掉时页面 ReferenceError 崩溃。
- **选择页视觉效果重构**：
  - 新增动态渐变霓虹球（`glow-orb`）在主界面背景漂浮。
  - 主页玻璃质感选择卡片悬停动效升级，新增匹配主题色的发光阴影投影（天蓝色与绯红色）以及三维微偏转效果。

### Optimized
- **三维投影深度缓存**：3D 圣诞树计算将 projection / rotateZ 计算由渲染提取期提前至物理更新期并直接绑定在粒子属性上，避免重复进行三角与开方矩阵计算，运行速度提升数十倍。
- **单路径批量绘制 (Single-Path Batching)**：星云引力连线由每次 path 绘制改为单次 accumulate、最后一次性 `stroke()` 渲染，彻底消除 Canvas Draw Call 瓶颈。
- **平方距离预剪裁 (Fast Squared Distance Pruning)**：粒子与引力源交互距离计算增加平方距离初步剪裁，90% 外围星尘粒子不再参与 `Math.sqrt` 计算。
- **清屏逻辑深度压榨**：
  - 删除了 `solar.js` 每一帧中冗余的第二次 `drawBg()` 画布擦除。
  - 进入场景后自动挂起主菜单背景 stars 绘制，让页面仅包含一个活跃 Canvas 更新。

### Removed
- 删除了 `audio.js` 中早期残留的 Web Audio 旋律代码（`playMelody`，`JINGLE_MELODY`，`INK_MELODY`，`melodyInterval`）。
- 删除了 `main.js` 中所有关于鼠标手势判定、按键切换等废弃接口。
