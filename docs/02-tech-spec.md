# 技术规范

## 技术栈

| 层 | 选型 |
|----|------|
| 桌面壳 | Electron（主进程读 Windows 剪贴板） |
| UI | Next.js 14（App Router）+ TypeScript strict |
| 样式 | Tailwind + shadcn/ui |
| 数据 | 本机会话内存 / 轻量本地；**不用** Supabase |
| 运行 | 本地 Electron + Next；**不部署** Vercel |

## 架构约定

```
Electron 主进程（轮询 clipboard）
        │ IPC
        ▼
Next/渲染进程（列表 UI）
```

- 主进程：监听文字/图片、写回剪贴板、退出时清空
- 渲染进程：展示、搜索、置顶/删除；不直接调原生剪贴板 API
- 「再次复制」须短冷却或内容指纹去重，避免自我监听死循环
- 图片：dataURL + 尺寸上限；过大则跳过并文字占位「图片过大」

## 工程禁区

- 不引入 Redux / Zustand 等额外状态管理
- 单文件 > 200 行：停下并询问
- 不接云端、登录、多设备同步
- 一次只实现路线图当前阶段（见 [04-execution-roadmap.md](./04-execution-roadmap.md)）

## Demo 约束

- 约 20 分钟量级可跑通当前阶段出口
- 优先最小可验收切片，禁止一次堆多阶段
