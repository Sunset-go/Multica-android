# Multica Android App

[![CI](https://img.shields.io/github/actions/workflow/status/Sunset-go/Multica-android/android-release.yml)](https://github.com/Sunset-go/Multica-android/actions/workflows/android-release.yml)
[![Latest Release](https://img.shields.io/github/v/release/Sunset-go/Multica-android)](https://github.com/Sunset-go/Multica-android/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![platforms: iOS · Android](https://img.shields.io/badge/platforms-iOS%20%7C%20Android-blueviolet)](#)

[Multica](https://github.com/multica-ai/multica) 的独立 Expo / React Native 客户端，从 Multica monorepo 中抽出。此仓库包含移动端应用（`apps/mobile/`）以及它所依赖的 `@multica/core` 业务逻辑包，作为一个可自包含构建的 pnpm workspace 组织。

> English version: [README.en.md](./README.en.md)

## 📦 下载 APK

最新正式版发布在 [Releases](https://github.com/Sunset-go/Multica-android/releases)，包含两种包：

- `multica-app-v<version>.apk` — universal（含全部 ABI，体积大，兼容老设备）
- `multica-app-v<version>-arm64.apk` — arm64-only（体积小，现代手机首选）

## 目录结构

- `apps/mobile/` — Expo 应用（iOS + Android），Android APK 构建的源头。
- `packages/core/` — 共享业务逻辑、API 客户端、类型定义、纯函数工具（运行时依赖）。
- `packages/tsconfig/`、`packages/eslint-config/` — workspace 内的工具链配置，被 `@multica/core` 引用。

## 环境准备

- Node.js + pnpm 10（`packageManager: pnpm@10.28.2`）
- iOS 需 Xcode，Android 需 Android SDK
- 完整的构建 / 装机指南见 `apps/mobile/README.md`

## 安装

```bash
pnpm install
```

`.env.staging` 和 `.env.production` 已提交入库（公开 URL）。本地后端场景下，把 `apps/mobile/.env.example` 复制为 `apps/mobile/.env.development.local`，并把 `EXPO_PUBLIC_API_URL` 改成你机器的局域网 IP。

## 常用脚本

以下命令均在仓库根目录执行（全部 delegate 到 `apps/mobile/`）：

| 命令 | 说明 |
|---|---|
| `pnpm dev:mobile` | 只启动 Metro（本地后端） |
| `pnpm dev:mobile:staging` | 只启动 Metro（staging 后端） |
| `pnpm dev:mobile:prod` | 只启动 Metro（生产后端） |
| `pnpm ios:mobile` | iOS 模拟器重建 + 安装（本地） |
| `pnpm ios:mobile:staging` | iOS 模拟器重建 + 安装（staging） |
| `pnpm ios:mobile:prod` | iOS 模拟器重建 + 安装（生产） |
| `pnpm ios:mobile:device` | USB iPhone 完整重建 + 安装（本地） |
| `pnpm ios:mobile:device:staging` | USB iPhone 完整重建 + 安装（staging） |
| `pnpm ios:mobile:device:prod` | USB iPhone 完整重建 + 安装（生产） |
| `pnpm ios:mobile:device:prod:release` | USB iPhone Release 构建 + 安装（生产） |
| `pnpm typecheck` | TypeScript 检查（mobile） |
| `pnpm lint` | ESLint（mobile） |
| `pnpm test` | 单元测试（mobile） |

> Android：`android/` 原生工程由 Expo prebuild 生成（已 gitignore）。运行 `pnpm exec expo prebuild --platform android`（或使用 EAS build）重新生成，然后通过 Gradle 构建 APK，与源 workspace 的产物保持一致。

## Android Release APK

在 `apps/mobile/android` 目录（prebuild 之后）：

```bash
ANDROID_HOME=/path/to/android-sdk ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

产物：`apps/mobile/android/app/build/outputs/apk/release/app-release.apk`（包名 `ai.multica.mobile`，版本 `0.2.0`）。
