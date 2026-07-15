# 项目目标

面向不懂代码的 Windows 用户，提供本机历史粘贴板，一键找回最近复制的文字/图片并再次粘贴。

# 工程路径

- **主目录**：`D:\vibe-coding\history_cv_tool`（在此开发与打包）
- **不要**在 `E:\` 移动硬盘上构建；日常使用安装包即可，可不插 E:

# 技术栈

- 桌面壳 · Electron（真剪贴板监听）
- 前端 · Next.js 14（静态导出）+ TypeScript strict
- 样式 · Tailwind
- 数据 · 仅本机会话内存；退出清空；超 24h 丢弃
- 发布 · electron-builder NSIS（本地安装，不上 Vercel / Supabase）

# 标准文件路径

| 用途 | 路径 |
|------|------|
| 产品需求 | [PRD.md](./PRD.md) |
| 需求摘要 | [docs/01-requirements.md](./docs/01-requirements.md) |
| 技术规范 | [docs/02-tech-spec.md](./docs/02-tech-spec.md) |
| 设计规范 | [docs/03-design-spec.md](./docs/03-design-spec.md) |
| 路线图 | [docs/04-execution-roadmap.md](./docs/04-execution-roadmap.md) |
| 开发日规范 | [docs/05-dev-log-guide.md](./docs/05-dev-log-guide.md) |
| 发布安装 | [docs/06-release.md](./docs/06-release.md) |
| 开发日日志 | [开发日/](./开发日/) |

# 启动

**日常**：安装 `dist\历史粘贴板 Setup 0.1.0.exe` 后双击 / 开机自启。

**开发**：

```powershell
npm run dev:app
```

**重新打包**：

```powershell
npm run dist
```

详见表 [docs/06-release.md](./docs/06-release.md)。

# 禁区

- ❌ 不引入 Redux/Zustand 等额外状态管理
- ❌ 单文件 > 200 行先停下问我
- ❌ 不上云同步 / Supabase / Vercel
- ❌ 不在 E: 移动硬盘上跑 `next build` / `npm run dist`

# 当前阶段

打包 + 开机自启 **已完成**（D: 产出 NSIS 安装包；应用内可开关开机自启）
