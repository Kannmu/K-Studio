# K-Studio

K-Studio 是基于 [CherryHQ/cherry-studio](https://github.com/CherryHQ/cherry-studio) 的个人对话特化版本。
它保留完整的对话能力，去掉日常不需要的入口，并针对长回答 / 大量公式的渲染做了性能优化。

- 上游：`https://github.com/CherryHQ/cherry-studio`
- 本仓库：`https://github.com/Kannmu/K-Studio`（GitHub Fork，保留上游关系）
- 基线：Cherry Studio `v2.2.0` 之后的 `main`

## 1. 任意模型都能指定思考强度（#24161）

问题：模型目录没有收录的新模型（例如 `gemini-4-carbon`）没有推理能力描述，
输入框因此不显示“思考强度”选择器，用户无法调整推理深度。

K-Studio 的处理分两层：

1. **目录层**：把 `gemini-4-carbon` 加进 provider-registry 的 Google creator
   （`packages/provider-registry/src/creators/google.ts`），并重新生成目录。
   Gemini 4 家族只接受 `low | medium | high`，目录层保证不会发出会被网关拒绝的值。
2. **用户覆盖层**：任何模型都可以在
   **设置 → 模型服务 → 模型 → 编辑 → 模型能力 → 推理** 打开“推理”。
   打开后输入框会出现思考强度选择器：
   - OpenAI 兼容 / OpenAI Responses / Anthropic 等端点：`none, minimal, low, medium, high, xhigh, max`
   - Gemini / Ollama 端点：`none, low, medium, high`（其原生字段只接受这些值）

   实现位于 `src/main/data/services/ModelService.ts` 的
   `manualDeclaredReasoning` / `withManualReasoningControls`：
   读取时对“用户声明推理能力、但目录没有 controls”的行补齐一套手工强度词表，
   请求仍走原来的 endpoint wire profile 编码，所以不会绕过既有协议适配。

如果某个新模型的 API 使用了非标准参数名，可以在
**助手编辑 → 模型设置 → 自定义参数** 里追加（例如 `reasoning_effort: "high"`），
这是 `#24161` 里“custom parameter override”的逃生口。

## 2. 长回答 / 公式渲染性能

聊天流式输出时，每个 token 都会触发一次 Markdown 解析和 KaTeX 渲染；
回答达到几万字符、包含大量公式时，最后一段会被反复重排，造成明显卡顿。
K-Studio 做了三处改动：

- **流式渲染节流**（`src/renderer/components/markdown/useThrottledStreamContent.ts`）：
  内容超过 16 KB 后，最多每 100 ms 重渲染一次，并始终追平最新文本；
  结束流式时立即用完整文本渲染。短回答不受影响。
- **KaTeX 渲染缓存**（`src/renderer/utils/katexRenderCache.ts`）：
  对同一公式 + 同一选项缓存 `renderToString` 结果（上限 2000 条），
  避免流式重渲染时重复排版公式。
- **全文字符串扫描短路**：只有内容里真的出现 `<svg` / `<style` 时才跑对应正则。

实测（打包版，打开一条 22,298px 的公式对话并连续滚动）：

- 平均帧间隔 13.8 ms（约 72 fps）
- p95 帧间隔 13.5 ms，最大 30.7 ms
- `>50ms` 掉帧数 0，Long Task 数 0
- 当前视口只挂载 5 条消息 / 9 个公式（虚拟列表按需渲染）

复测脚本：`.context/cherry-electron-dev/bench-now.mjs`（连接 CDP 后用
`.dynamic-virtual-list` 滚动取样）。

## 3. 对话优先界面

K-Studio 是对话专用版。侧边栏只保留对话相关入口：

- 保留：助手（对话）、置顶的对话/话题
- 隐藏：Agent、工作区、定时任务、绘画、市场、翻译、小程序、知识库、文件、代码、笔记

隐藏而不是删除：上游代码仍在仓库里，后续 `git rebase upstream/main` 冲突面最小，
上游的对话修复也能直接合并进来。过滤入口见
`src/renderer/config/kStudio.ts` 与 `src/renderer/components/app/Sidebar.tsx`。

## 4. 设置页收敛

设置菜单只保留日常对话需要的项目：

- 个人信息：仅本地头像、名称（无 Cherry 账号、订阅、登出）
- 模型服务、默认模型
- 文档处理：文档解析 / OCR（对论文与附件对话至关重要，完整保留）
- 通用、外观、通知、数据、归档、快捷键、关于

隐藏：本地模型、API 网关、MCP、技能、提示词库、浏览器/电脑操作、频道、
设备互联、快捷助手、划词助手、截图、环境依赖、语音、用量。
侧边栏只保留“对话”；输入框移除语音听写和图片生成入口；消息菜单移除“朗读”。
隐藏项同时有路由守卫：旧标签页或手动 URL 进入已隐藏设置页会被重定向到模型服务。

实现位置：

- `src/renderer/config/kStudio.ts`：K-Studio 功能开关
- `src/renderer/components/settingsMenu.ts`：设置菜单可见路由
- `src/renderer/pages/settings/ProfileSettings.tsx`：本地资料页

## 5. 借鉴 Kelivo 的后续方向

[Kelivo](https://github.com/Chevey339/kelivo) 在聊天体验与界面美学上有一些比 Cherry Studio 更细的设计，
K-Studio 计划按优先级逐步吸收（当前版本尚未实现，记录在此避免遗忘）：

1. **聊天气泡外观**（已实现）：毛玻璃 / 实色 / 跟随主题，0–24px 圆角，聊天背景（无/极光/日落/网格），
   消息间距 0–16px。入口：设置 → 外观 → 聊天外观。
2. **每条消息的“自定义请求体”**：按助手覆盖嵌套 JSON，补足 `#24161` 的 raw override 需求。
3. **思考预算自定义**：除档位外，允许直接填 token budget（Gemini 2.x / Anthropic）。
4. **会话小地图**：长对话右侧导航缩略图（Cherry 已有 outline，可增强为缩略图）。
5. **助手级正则替换规则**：对模型输出做可配置的文本替换。
6. **信息密度/字体**：消息间距已实现；后续可补独立行距与代码字号预设。

这些功能都应通过 K-Studio 自己的配置层实现，尽量不改动上游数据结构，
以便后续 `git rebase upstream/main`。

## 6. 品牌与数据

- `package.json` → `productName: "K-Studio"`（Electron userData 随之变为 `%APPDATA%\K-Studio`）
- `electron-builder.yml` → `appId: com.kannmu.kstudio`、`productName: K-Studio`
- `src/shared/utils/constants.ts` → `APP_NAME = 'K-Studio'`
- 上游自动更新已禁用（`AppUpdaterService.ts` 的 `K_STUDIO_UPDATES_ENABLED = false`），
  避免 Cherry Studio 的更新覆盖本 fork。

### 数据导入

原 Cherry Studio 数据位于 `D:\Temp\CherryStudioData`（v2.2.0 的 userData 目录）。
已复制到 `%APPDATA%\K-Studio`，包括：

- `Data/cherrystudio.sqlite`（聊天历史、助手、设置）
- `Data/Files`（附件，约 2.8 GB）
- `config.json`、`Preferences`、`Local Storage`、`IndexedDB`、`Network`（登录态）

首次启动 K-Studio 会直接读取这份数据；`config.json` 中已关闭自动更新和匿名数据采集。

## 7. 日常使用与构建

### 开发模式（改代码时）

```bash
pnpm install          # 首次
pnpm dev              # Electron + HMR
```

### 日常使用的打包产物

K-Studio 的打包刻意做了轻量化：

- 不打包 mise / bun / uv / ripgrep / MinGit 等 Agent 运行时二进制（约 200 MB），
  `before-pack.js` 通过 `KS_SKIP_BUNDLED_BINARIES=1` 跳过；
- Electron 只保留 `zh-CN` / `en-US` 语言包（原始配置还带 ja/ru/de/zh-TW）。

推荐 **unpacked 目录版**（启动最快、无需安装、替换文件夹即可升级）：

```bash
pnpm build:ks
# 产物：dist/win-unpacked/K-Studio.exe
```

需要单文件分发时再打 portable：

```bash
pnpm build:ks:portable
# 产物：dist/K-Studio-<version>-x64-portable.exe
```

> 首次打包前需要 `pnpm rebuild:electron`（`pnpm dev` 会自动执行）。

### 升级上游

```bash
git fetch upstream
git rebase upstream/main
pnpm install
pnpm dev
```

K-Studio 的改动集中在少量文件中，冲突通常只出现在：

- `src/main/data/services/ModelService.ts`（手工推理词表）
- `packages/provider-registry/src/creators/google.ts`（Gemini 4 Carbon）
- `src/renderer/components/markdown/AppMarkdown.tsx`、`useThrottledStreamContent.ts`
- `src/renderer/components/app/Sidebar.tsx`、`src/renderer/config/kStudio.ts`
- `electron-builder.yml`、`package.json`、`src/shared/utils/constants.ts`

## 8. 设计取舍

- **隐藏而不是删代码**：需求是“我不用”，不是“仓库里不能有”。保留上游模块能让每次
  rebase 更便宜；删除 Agent/MCP/知识库会牵动路由、IPC、数据库和大量测试，维护成本远高于收益。
- **模型级而不是全局开关**：思考强度是模型/端点的能力，放在模型抽屉里可以按模型保存，
  同一个助手换模型也不会带错档位。
- **目录 + 手工覆盖双层**：已知模型走目录（正确的原生词表），未知模型走用户声明
  （完整词表），二者共用同一套请求编码器。
