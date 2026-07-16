# 历史粘贴板 · 会话交接（HANDOFFt）

> 写给**完全没有上下文**的新会话。请先读本文，再读 `D:\vibe-coding\history_cv_tool\cursor.md` 与 `docs/06-release.md`。

**今日日期参考**：2026-07-15  
**主工程路径（必须）**：`D:\vibe-coding\history_cv_tool`  
**旧副本（勿再构建）**：`E:\vibe-coding\history_cv_tool`（移动硬盘）

---

## 1. 我们在做什么

做一个 **Windows 本机历史剪贴板**桌面应用：

- 自动记录最近复制的**文字和图片**
- 列表（时间降序）、置顶 / 删除 / 文字搜索、点击写回剪贴板（用户自行 Ctrl+V）
- 数据只存本机会话；**关窗进托盘继续运行并保留记录**；托盘「退出」或关机清空；超 24h 丢弃
- UI：简洁、浅粉色
- **不要**云同步 / Supabase / Vercel 部署

技术栈（已落地）：

- Electron（剪贴板监听）+ Next.js 14（App Router，生产为**静态导出**）+ Tailwind + TypeScript
- 发布：electron-builder → NSIS 安装包
- 开机自启：`app.setLoginItemSettings` + UI 开关

产品权威需求：`PRD.md`；分阶段路线：`docs/04-execution-roadmap.md`（D0–D6 功能已完成）。

---

## 2. 已经完成了什么

### 功能 MVP（D0–D6）

- [x] 文档体系：`docs/01`～`05`、`开发日/`、`cursor.md`
- [x] Electron + Next 开发壳：`npm run dev:app`
- [x] 文字/图片剪贴板轮询 + IPC（`clipboard:item`）
- [x] 再复制（writeText / writeImage）+ 冷却去重
- [x] 置顶 / 删除 / 文字搜索
- [x] 浅粉单列表 UI、空状态、「图片过大」占位
- [x] 开机自启 IPC + `components/AutostartToggle.tsx`
- [x] **v0.2.0** 关窗进托盘后台；托盘退出/关机才清空（`electron/tray.js`）

### 打包与路径迁移

- [x] 工程已复制到 **`D:\vibe-coding\history_cv_tool`**（以后一切开发/打包只在这里）
- [x] 在 D: 上 `next build`（`output: 'export'`）成功，产出 `out/`
- [x] electron-builder 成功，安装包：

  **`D:\vibe-coding\history_cv_tool\dist\历史粘贴板 Setup 0.2.0.exe`**（重打包后）

- [x] 发布说明：`docs/06-release.md`

### 关键代码位置

| 职责 | 路径 |
|------|------|
| 主进程/轮询/写回/自启 | `electron/main.js` |
| preload API | `electron/preload.js` |
| UI 主页面 | `app/page.tsx` |
| 卡片/搜索/自启开关 | `components/*` |
| 排序过滤 | `lib/history.ts` |
| 静态导出配置 | `next.config.mjs` |
| 打包配置 | `package.json` → `build` / `scripts.dist` |

生产环境用自定义协议 `histclip://` 加载 `out/`（见 `electron/main.js`），避免 `file://` 绝对路径资源问题。

---

## 3. 当前卡在哪 / 待用户确认

**工程侧打包链路已通，无已知代码阻塞。**

待用户本机验收（新会话可提醒用户做）：

1. 双击安装 `dist\历史粘贴板 Setup 0.1.0.exe`
2. **拔掉 E 盘**后仍能运行、听剪贴板
3. 勾选「开机自动启动」后重启是否生效
4. SmartScreen「未知发布者」——未做代码签名，属预期

可选未做（非阻塞）：

- 自定义应用图标
- 系统托盘 / 后台常驻
- 代码签名
- Cursor 工作区仍可能开在 E: ——应改为打开 **D:** 工程

---

## 4. 下一步计划（建议优先级）

1. **用户安装验收**（上节清单）；按反馈修体验
2. （可选）托盘 + 开机静默启动
3. （可选）应用图标；若要改 exe 元数据，需开启 Windows「开发人员模式」或管理员（见踩坑）
4. 确认无问题后可删 D: 上 `node_modules` 省磁盘（再打包时再 `npm install`）
5. E: 上旧副本可当备份或删除，**禁止**再当构建目录

开发命令（仅 D:）：

```powershell
cd D:\vibe-coding\history_cv_tool
$env:TEMP = "D:\vibe-coding\tmp"
$env:TMP  = "D:\vibe-coding\tmp"
npm run dev:app          # 开发
npm run dist             # 重新打包
```

缓存建议放在 D:：`npm-cache` / `electron-cache` / `electron-builder-cache`（见 `docs/06-release.md`）。

---

## 5. 踩过的坑（绝对不要再踩）

1. **不要在 E:（移动硬盘）上跑 `next build` / `npm run dist`**  
   - 会 `EISDIR: illegal operation on a directory, readlink ...`  
   - 且用户日常开机往往**不插 E 盘**，装在 E: 无意义  

2. **不要把大量 npm/electron 缓存堆在 C:**  
   - C: 空间紧张；构建前设 `TEMP`/`TMP`（及 npm/electron cache）到 **`D:\vibe-coding\...`**

3. **不要假设必须每天 `npm run dev:app`**  
   - 日常应使用 **安装包**；源码+`node_modules` 只为开发/重打包保留

4. **electron-builder + winCodeSign 符号链接失败**  
   - 报错：`Cannot create symbolic link`（无创建符号链接权限）  
   - 应对：`build.win.signAndEditExecutable: false`，并设 `CSC_IDENTITY_AUTO_DISCOVERY=false`  
   - 已写入 `package.json`；不要轻易改回去除非用户开了开发人员模式

5. **生产不要只 `loadURL('http://localhost:3000')`**  
   - 打包后必须加载静态 `out/`（当前为 `histclip://` 协议）

6. **写回剪贴板会触发自我监听**  
   - 已有冷却 + fingerprint；改轮询逻辑时保留

7. **单文件 ≤200 行；不引入 Redux/Zustand；不上 Supabase/Vercel**  
   - 见 `cursor.md` 禁区 / PRD「明确不做」

8. **robocopy 退出码 1 = 成功复制了文件**，不是失败

9. **工作区若仍指向 E:**  
   - 改代码/打包请切到 **`D:\vibe-coding\history_cv_tool`**，否则改错副本

---

## 6. 给新会话的开工检查清单

- [ ] 打开文件夹：`D:\vibe-coding\history_cv_tool`
- [ ] 读完本文件 + `cursor.md` + `docs/06-release.md`
- [ ] 确认安装包是否存在：`dist\历史粘贴板 Setup 0.1.0.exe`
- [ ] 问用户安装验收结果；**不要**先在 E: 上重装依赖或 rebuild
- [ ] 若需重打包：在 D: 设好 TEMP/缓存后再 `npm run dist`

---

## 7. 一句话状态

**MVP 功能已在 D 盘打出可安装包；下一会话优先协助用户安装验收与体验反馈，禁止再回 E 盘构建。**
