# Contributing Guide (贡献指南)

感谢您对本项目的关注与支持！我们欢迎一切形式的贡献，包括但不限于报告 Bug、提出新功能建议、改进文档或直接提交代码 PR。

---

## 🛠️ 开发与调试流程 (Workflow)

1. **Fork 本仓库** 并克隆到本地。
2. 运行一键配置脚本启动本地服务器（因为 MediaPipe 的 WebAssembly 文件存在浏览器跨域安全策略，无法通过双击直接运行）：
   ```bash
   python3 setup.py
   ```
3. 在本地修改代码：
   - 核心控制器与生命周期：`js/main.js`
   - 手势检测与摄像头：`js/gesture.js`
   - 粒子渲染模块：`js/solar.js` (星尘漩涡)、`js/tree.js` (粒子圣诞)
   - 音效控制模块：`js/audio.js`
   - 样式与动画：`css/app.css`
4. 本地修改完成后，在浏览器中测试，并确保控制台（Console）无报错或警告。

---

## 📌 提交代码规范 (Commit Convention)

为了保持 Git 历史提交记录的整洁与可读性，本项目遵循标准的 Commit Message 规范。您的提交信息应当以合适的前缀开头：

- `feat:` 新功能 (New Feature)
- `fix:` 修复 Bug (Bug Fix)
- `docs:` 文档/注释修改 (Documentation)
- `style:` 格式或样式修改，不影响代码逻辑 (Formatting/Styling)
- `refactor:` 代码重构，未增减功能 (Refactoring)
- `perf:` 提升运行效率的性能优化 (Performance)
- `chore:` 辅助开发工具或依赖配置的变动 (Chore)

### 示例 (Examples)
- `feat: add glassmorphic loading transition screen`
- `fix: resolve camera helper loading exception`
- `perf: prune star particles calculations with squared distance`

---

## ⚡ 代码质量与性能要求 (Quality Standard)

本 Demo 专注于在 Web 端压榨 Canvas 2D 粒子渲染性能，因此在提交代码时请遵循以下开发原则：
1. **零语法报错**：提交前确保分析代码语法合法。在根目录下运行：
   ```bash
   node -c js/*.js
   ```
2. **渲染性能第一**：禁止在 `requestAnimationFrame` 主渲染循环中动态创建大对象或频繁调用 `Math.sqrt`、`Math.sin` 等开销较大的计算。尽量提前计算并缓存投影状态，或使用**平方距离**预先剔除无效粒子。
3. **极简依赖**：保持本项目零打包、零 WebGL Webpack 依赖的 Vanilla JS 架构，避免引入外部 UI 库或打包依赖。
4. **多端响应式**：所有的 CSS 特效（如毛玻璃 `backdrop-filter`）在 Safari/Chrome 以及移动端必须具备良好的兼容性表现。
