# AGENTS.md

> AI 编程助手与人类开发者的共同开发规范，由 pi-init 生成，请结合实际修订。

## 1. 项目概述

Multica Android App 是从 Multica monorepo 抽出来的独立 **Expo / React Native** 客户端仓库，同时承载依赖它的 `@multica/core` 业务逻辑包，形成可自包含构建的 pnpm workspace。产出物是 iOS + Android 原生应用，Android APK 通过 `expo prebuild` 生成的 Gradle 工程构建。

核心技术栈与关键依赖：

- **运行时**：React Native（Hermes）+ Expo SDK ~54/55 + expo-router（file-based routing）
- **语言**：TypeScript `strict`（ESNext target，`moduleResolution: bundler`）
- **样式**：Tailwind v4 + NativeWind（`global.css` CSS 变量 + `tailwind.config.js` 映射 + `lib/theme.ts` 双份镜像）
- **状态 / 缓存**：Zustand（store）、TanStack Query v5（server state）、zod v4（响应校验，`parseWithFallback`）
- **UI**：React Native Reusables (RNR) 优先，其次 iOS 原生 API（Alert / ActionSheetIOS / Haptics / Pickers），最后才手写
- **实时**：`ws-client.ts` 单例 + `realtime-provider.tsx` 生命周期 + 每功能 `use-<feature>-realtime.ts` 订阅
- **测试**：Vitest（Node 环境，只测 `lib/**` 与 `data/**` 纯逻辑），`jsdom` + React Testing Library 用于组件测试
- **包管理**：pnpm 10.28.2 + `pnpm-workspace.yaml` `catalog:` 版本锁定

## 2. 快速命令

从**仓库根目录**执行（根 `package.json` 全部 delegate 到 `apps/mobile/`）：

```bash
pnpm install                                # 首次安装依赖

# Metro（本地开发，需先启动本地后端并配置 .env.development.local）
pnpm dev:mobile
pnpm dev:mobile:staging                     # 接 staging 后端
pnpm dev:mobile:prod                        # 接生产后端

# iOS（模拟器 / 真机）
pnpm ios:mobile                             # 模拟器 + 本地后端
pnpm ios:mobile:staging                     # 模拟器 + staging
pnpm ios:mobile:device:prod                 # USB iPhone + 生产（开发签名）
pnpm ios:mobile:device:prod:release         # USB iPhone + 生产（Release 签名）

# 质量门禁（PR 前必跑）
pnpm typecheck                              # TypeScript 检查
pnpm lint                                   # ESLint
pnpm test                                   # Vitest 单测

# Android APK（会先自动 bump 版本再构建）
pnpm build:android:apk                      # arm64-v8a release
pnpm build:android:apk:universal            # 全 ABI release

# 单独跑 core 包的检查
pnpm -C packages/core typecheck
pnpm -C packages/core lint
pnpm -C packages/core test
```

⚠️ 首次构建 Android 前必须先生成被 gitignored 的 `android/` 目录：

```bash
pnpm -C apps/mobile exec expo prebuild --platform android
```

## 3. 目录结构说明

```
apps/mobile/                    # Expo app（真正的移动端源码）
├── app/                        # expo-router 文件路由；(app)/[workspace] 是登录后根
│   ├── _layout.tsx             # 根 Stack，负责 auth initialiser / ThemeProvider / WS provider
│   ├── index.tsx               # splash → auth gate → /login 或 /(app)
│   └── (app)/[workspace]/      # workspace 上下文的所有路由
├── components/                 # 组件：ui/（通用原语）+ <domain>/（issues, chat, inbox, project…）
├── data/                       # API 客户端 + TanStack Query 定义
│   ├── api.ts                  # ApiClient（fetchValidated / fetchValidatedWith）
│   ├── schemas.ts              # 移动端 Zod schema + EMPTY_* fallback
│   ├── queries/                # 每个功能一份 key factory（3 段 shape）
│   ├── mutations/              # 乐观更新 + rollback
│   ├── realtime/               # <feature>-ws-updaters.ts（cache patch 函数）
│   ├── auth-store.ts           # Zustand：token / session
│   ├── workspace-store.ts      # Zustand：当前 workspace
│   └── secure-storage.ts       # expo-secure-store 封装
├── lib/                        # 无框架依赖的纯函数 + hooks（time-ago、theme、utils、request-id…）
├── scripts/                    # bump-android-version.mjs、copy-versioned-apk.mjs
├── docs/                       # ADR、RNR 迁移计划、Markdown 渲染调研
├── .env.example / .env.staging / .env.production   # 提交入库的公开 env
├── app.config.ts               # Expo 配置；版本、versionCode、scheme、权限
├── global.css / tailwind.config.js                 # CSS 变量 + Tailwind 映射
├── CLAUDE.md                   # ⭐ 项目内**最详细**的规范：RNR waterfall、Realtime、APK、Lessons
├── vitest.config.ts            # Node 环境，只跑 lib/** 与 data/**
└── tsconfig.json               # extends expo/tsconfig.base + strict + @/ alias

packages/core/                  # @multica/core：跨端共享的业务逻辑
├── api/                        # 纯 API schema、ws-client、client 骨架（无 React 依赖的部分）
├── <feature>/                  # issues / inbox / chat / agents / runtimes / workspace / …
│   ├── queries.ts              # key factory（跨端共享的 3 段 shape 定义参考）
│   ├── mutations.ts
│   ├── ws-updaters.ts          # ⚠️ 移动端**禁止**直接 import，只作为设计参考
│   └── index.ts                # 桶文件，供 packages/core/package.json exports 白名单
├── types/                      # 全类型定义（issue / chat / event / agent / runtime…）
├── platform/                   # core-provider、storage、system-notification
├── i18n / feature-flags / analytics / diagnostics
└── package.json                # exports 白名单：每个功能都要在这里登记才能被引用

packages/tsconfig/              # base.json / react-library.json，被 core 与 mobile 继承
packages/eslint-config/         # base.js / react.js / next.js，被 mobile 继承
```

## 4. 代码风格与规范

### TypeScript
- `strict: true`，启用 `noUnusedLocals / noUnusedParameters / noImplicitReturns / noUncheckedIndexedAccess`。
- 所有类型通过 `packages/core/types/*` 或 `apps/mobile/data/schemas.ts` 里的 Zod 定义派生，禁止重复手写 interface。
- 路径别名：`@/*` → `apps/mobile/*`。跨包引用必须走 `packages/core/package.json` 的 `exports` 白名单，禁止深层相对路径穿越。

### 命名与文件组织
- 文件：`kebab-case.ts(x)`；组件：`PascalCase.tsx`；hooks：`use-*.ts`；测试与源文件同目录同名 `.test.ts`。
- 目录：通用原语在 `components/ui/`，领域组件在 `components/<domain>/`。**不要为一个页面手写新原语**——RNR 已经有的（Avatar / Button / Dialog / Select / Switch / Separator…）用 `npx @react-native-reusables/cli@latest add <name>` 引入。
- 组件导出：一个文件一个默认导出组件；辅助子组件留在同文件内不导出。

### 样式
- **只走语义 token**：`bg-background`、`text-muted-fore`、`text-primary`、`border-input`…，禁止硬编码 hex（`#71717a` 等 Tier C 遗留可以暂时留下，但**新代码不得引入**）。
- **改 `global.css` 的 CSS 变量必须同步 `lib/theme.ts`**（两者互相镜像）。
- `darkMode: 'class'`（不是 media query），通过 `useColorScheme().setColorScheme(mode)` 切换，选择存在 `expo-secure-store` 的 `theme-preference` key。
- `cn()` helper 在 `lib/utils.ts`，是 RNR 同一份，直接复用。

### ESLint
- `apps/mobile/eslint.config.js` 从 `@multica/eslint-config/react.js` 扩展；`apps/mobile/CLAUDE.md` 里的 `@ts-expect-error` / `eslint-disable` 是允许注释，不要清理。

## 5. 禁止规则（NEVER Rules）

🚫 **禁止手动修改 `node_modules/`、`dist/`、`build/`、`coverage/`、`*.tsbuildinfo`、`*.apk`、`apps/mobile/android/`**——全部是构建产物，`apps/mobile/android/` 由 `expo prebuild` 生成，改一次都会被覆盖。

🚫 **禁止修改 `pnpm-lock.yaml`**（除非真的加了新依赖）。加依赖必须 `pnpm view <pkg> dist-tags` 先确认目标 tag；Expo 系包（`expo-*` / `react-native-*`）必须 `pnpm exec expo install <pkg>`，让 Expo 挑 SDK 兼容版本，`pnpm add` 会拉到不兼容的 `latest`。

🚫 **禁止在代码中硬编码 API Key / token / password / 密钥**——移动端所有密钥只能通过 `expo-secure-store` 或环境变量注入（`.env.example` 只放占位，`.env.development.local` 已在 `.gitignore`）。公开的 `.env.staging` / `.env.production` 只放后端 URL，不要往里加敏感字段。

🚫 **禁止在 API 响应上直接 `as T` 强转**——每个读接口的返回体必须走 `fetchValidated(path, schema, fallback, opts)` / `fetchValidatedWith(...)`，schema 从 `packages/core/api/schemas.ts` 复用，fallback 在 `apps/mobile/data/schemas.ts` 用 `EMPTY_*` 常量保证完全类型匹配。

🚫 **禁止从 `packages/core/<feature>/ws-updaters.ts` import 到 mobile**——即使类型看起来能对齐，key factory 是不同 runtime 实例，会导致静默漂移。移动端要 `apps/mobile/data/realtime/<feature>-ws-updaters.ts` 独立实现，并在文件顶部注释里 mirror web 的接线方式。

🚫 **禁止跳过 `pnpm typecheck && pnpm lint && pnpm test` 直接提交**——这三项是 mobile-verify CI 的硬门禁。

🚫 **禁止新建 `apps/mobile/<新子目录>/` 后不验证 git tracking**——根 `.gitignore` 有 `data/`、`build/`、`bin/`、`*.app`、`*.dmg` 这类全局规则会静默吞掉新源码目录。每次新建子目录必须：
```bash
git check-ignore -v <dir>/<file>    # 若命中则加 !<dir>/ 反例
git ls-files <dir>                   # 确认每个文件都被 track
```

🚫 **禁止手写新的通用 UI 原语**（如按钮、头像、状态图标的变体）——必须先走完 `iOS 原生 API > RNR > 停下来问` 的 waterfall；只有 ≥3 个调用点且 RNR / iOS 原生都没有时才允许新增 `components/ui/` 文件。

🚫 **禁止直接 `gradlew assembleRelease`**——版本号的 4 处写入（根 `package.json`、`apps/mobile/package.json`、`app.config.ts` 的 `version` + `android.versionCode`、`android/app/build.gradle` 的 `versionName` + `versionCode`）必须由 `scripts/bump-android-version.mjs` 统一处理，否则 versionCode 不递增，Android 装不上。

🚫 **禁止跳过 signal 转发**——每个读查询的 `queryFn` 必须写成 `({ signal }) => api.xxx({ signal })`；每个 api.ts 读方法必须接受 `opts?: { signal?: AbortSignal }` 并转发。`api.ts` 里禁止使用 `AbortSignal.timeout()` / `AbortSignal.any()`——Hermes 不支持，只能用手动 `AbortController` + `setTimeout`。

🚫 **禁止在 formSheet 之外用自定义 Modal + 手写背景遮罩承载长列表 / 搜索 / 键盘 / 表单**——一律用 Expo Router 的 `presentation: "formSheet"` 路由 + 共享 `SHEET_OPTIONS`。`SheetShell` 已删除，不复活。

🚫 **禁止修改 `apps/mobile/CLAUDE.md`**（除非任务明确要求）——那份是更细粒度的项目宪法，本文件只是入口索引。

⚠️ 移动端是 Bearer token 鉴权，**不要加 CSRF / cookie / `credentials: "include"`**——移动端不存在 cookie 攻击面。

⚠️ iOS 是主目标，Android 只是 prebuild 产物。行为差异（formSheet 在 Android 退化为普通 modal）可以接受，但要在调用点注释里说明。

## 6. Git 工作流

- **分支**：`main` 是唯一 trunk；feature 分支从 `main` 拉，命名 `feat/<scope>-<desc>` / `fix/<scope>-<desc>` / `chore/<scope>`。
- **提交**：Conventional Commits，示例：
  ```
  feat(inbox): add swipe-to-archive with haptic feedback
  fix(api): forward TanStack Query signal through listInbox
  chore(deps): bump expo to 54.5.0
  ```
- **PR**：
  1. 关联 scope（`apps/mobile/**` 或 `packages/core/**`）决定 CI：mobile-only 走 `mobile-verify.yml`；核心包类型变更还触发 web/desktop 的 CI。
  2. 描述里必须包含：变更范围、UI 变更的前后截图（formSheet / Modal / 键盘相关）、跨客户端验证结果（web 改一条数据，mobile 500ms 内是否同步）。
  3. 触碰 Tier C 遗留组件（`ActorAvatar` / `StatusIcon` / `PriorityIcon` / `PresenceDot` 等）时，PR 描述里列一下看到的硬编码 hex 作为 follow-up，不在本 PR 里顺手重写。
- **Release / Tag**：
  - Android APK：本地 `pnpm build:android:apk` 会自增 patch；GitHub Release 通过 `v0.2.3` 这种 tag 触发 `.github/workflows/android-release.yml`（tag 版本会**覆盖**本地 bump，不 +1）。
  - 移动端 release cadence 与 `v*.*.*` 主 tag 解耦。
- **不要 force push** `main`；rebase 而非 merge commit 保持线性历史。

## 7. 常见任务指南

### 新增一个后端接口 / 新功能
1. 先在 `packages/core/api/schemas.ts` 或对应 `<feature>/` 里找 web 版本，**mirror 而不重新发明** endpoint、request body、response schema、key factory。
2. `apps/mobile/data/api.ts` 加方法：读用 `this.fetchValidated(path, schema, EMPTY_FALLBACK, { signal })`；写用 `fetchValidatedWith`（响应被 UI 消费时）或 `this.fetch<T>`（响应只是 `{ count }` / `void` 时）。
3. `apps/mobile/data/queries/<feature>.ts` 加 3 段 key factory（`all` / `list` / `detail`），mutation 里全部通过 factory 引用，禁止内联字符串。
4. `apps/mobile/data/schemas.ts` 定义 `EMPTY_*` fallback，形状与 success type 严格一致。
5. `packages/core/package.json` 的 `exports` 白名单登记新的导出路径。
6. 若该功能有事件，加到 `packages/core/types/events.ts` 的 `WSEventType` + payload + `WSEventPayloadMap` 三处（漏第 3 处会让调用方拿到 `unknown`）。

### 新增一个实时订阅
1. 判断 patch 还是 invalidate：payload 带完整对象 → `setQueryData`；只带 id → `invalidateQueries`。
2. **不要** import `packages/core/<feature>/ws-updaters.ts`；在 `apps/mobile/data/realtime/<feature>-ws-updaters.ts` 独立实现，文件头注释 mirror web 版本。
3. 用 `useWSSubscriptions(setup, deps)` 封装样板；handler 用 `ws.on<E>()` 让 payload 自动派生类型，禁止 `as XxxPayload` 冗余 cast。
4. 挂载位置：list 级别挂到 `<RealtimeSubscriptions />`（workspace `_layout.tsx`）；per-record 挂到拥有 record 的 screen（按 route id 过滤）。
5. `ws.onReconnect()` 只 invalidate 自己拥有的 key，禁止全局清扫。

### 新增一个 UI 组件 / 交互
1. 走 waterfall：**iOS 原生 API**（Alert / ActionSheetIOS / Haptics / Pickers / Share）→ **RNR**（`npx @react-native-reusables/cli@latest add <name>`）→ 都不行再问用户。
2. 通用原语 → `components/ui/`（≥3 个调用点 + RNR 没有）；领域组件 → `components/<domain>/`。
3. 长列表 / 搜索 / 表单 sheet → Expo Router `presentation: "formSheet"` 路由 + 共享 `SHEET_OPTIONS`，注册到 workspace `_layout.tsx` 的 Stack。
4. 短菜单（≤5 项）→ iOS `ActionSheetIOS`；确认 / 破坏性 → `Alert.alert`。
5. 破坏性左滑（archive / delete）：`ReanimatedSwipeable` + `renderRightActions` + `Haptics.impactAsync('medium')`；**禁止** `onSwipeableOpen` 自动触发。

### 运行单个测试
```bash
# mobile
pnpm -C apps/mobile exec vitest run lib/time-ago.test.ts
pnpm -C apps/mobile exec vitest run data/realtime/ --runInBand
pnpm -C apps/mobile exec vitest --watch lib/timeline-thread.test.ts

# core
pnpm -C packages/core exec vitest run issues/queries.test.ts

# 全量
pnpm test
```

### 调试
- **Metro**：`pnpm dev:mobile` 后在设备打开 URL；`r` 热更，`shift+R` 冷启，`a` dev menu。
- **Network**：`api.ts` 已按请求打 `[api] → METHOD path (rid=xxx)` / `[api] ← STATUS path (rid=xxx, 123ms)`；5xx 走 `console.error`，404 走 `console.warn`。后端 telemetry 通过同一个 `X-Request-ID` 对齐。
- **类型问题**：`pnpm typecheck`；Zod parse 失败在开发环境会 log fallback 使用情况。
- **原生 / 键盘 / 导航问题**：优先怀疑 SafeArea（`useSafeAreaInsets` 在 Modal 里返回 0）和 formSheet 的 detent 高度。
- **APK 构建**：如果 `bump-android-version.mjs` 找不到 `android/app/build.gradle`，先 `pnpm -C apps/mobile exec expo prebuild --platform android` 再生成一次。
- **CI 挂但本地过**：CI 是干净 checkout，`android/` 目录不存在，只有本地跑过 `prebuild` 才会通过。

### 添加新依赖
1. `pnpm view <pkg> dist-tags` 确认目标 tag（`latest` / `sdk-XX` / `canary`）。
2. Expo 系：`pnpm exec expo install <pkg>`；其他：`pnpm add <pkg>@<version>`，最好加到 `pnpm-workspace.yaml` 的 `catalog:` 统一锁定。
3. `packages/core/package.json` 或 `apps/mobile/package.json` 的 `dependencies` 引用用 `catalog:` 语法。
4. 检查 `pnpm-lock.yaml` diff 合理后提交。

### 发布新 APK
```bash
# 本地验证
pnpm build:android:apk               # arm64 单架构
# 产物在 apps/mobile/dist/multica-app-v<version>.apk

# GitHub Release（自动打 tag 触发）
git tag v0.2.4 && git push origin v0.2.4
```
