# 发布与安装

## 工程位置（重要）

- **主工程目录**：`D:\vibe-coding\history_cv_tool`
- **勿在 E:（移动硬盘）上构建**：易触发 `next build` EISDIR，且日常开机常不插盘
- **勿把大量缓存堆在 C:**：构建时使用 `D:\vibe-coding\tmp` 等作为临时目录

## 日常使用（推荐）

1. 运行安装包：`D:\vibe-coding\history_cv_tool\dist\历史粘贴板 Setup 0.1.0.exe`
2. 按向导安装（可选改安装目录；建议仍装在 D:）
3. 桌面 / 开始菜单打开「历史粘贴板」
4. 窗口内勾选「开机自动启动」

装好后**不必**保留 `node_modules`，也**不必**再插 E: 盘。只有要改代码、重新打包时才需要完整工程。

## 开发调试

```powershell
cd D:\vibe-coding\history_cv_tool
$env:TEMP = "D:\vibe-coding\tmp"
$env:TMP  = "D:\vibe-coding\tmp"
npm run dev:app
```

## 重新打包

```powershell
cd D:\vibe-coding\history_cv_tool
$env:TEMP = "D:\vibe-coding\tmp"
$env:TMP  = "D:\vibe-coding\tmp"
$env:npm_config_cache = "D:\vibe-coding\npm-cache"
$env:ELECTRON_CACHE = "D:\vibe-coding\electron-cache"
$env:ELECTRON_BUILDER_CACHE = "D:\vibe-coding\electron-builder-cache"
npm run dist
```

产物在 `dist\`。未做代码签名时，Windows SmartScreen 可能提示「未知发布者」，属预期。

## 省磁盘

- 可删除：`node_modules`、`.next`、构建缓存目录（`D:\vibe-coding\npm-cache` 等）
- 保留：源码（若还要开发）+ `dist\` 安装包或已安装程序
