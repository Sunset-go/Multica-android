# Multica Mobile (iOS)

Multica 的 Expo + React Native iOS 客户端。与 web/desktop 相互独立，仅通过 `@multica/core/` 共享类型。锁定的技术栈基线和 import 规则见 [`CLAUDE.md`](./CLAUDE.md)。

## 只想在手机上用？（不做开发）

Multica 目前还没有上架 App Store——在上架之前，任何想在 iPhone 上使用它的人都得从源码构建。一条命令：

```bash
pnpm ios:mobile:device:prod:release
```

它连接的是和 `multica.ai` 相同的后端，所以已有账号可直接登录。

**前置条件**：装有 Xcode 的 Mac、Xcode → Settings → Accounts 下已加入的免费 Apple ID、通过 USB 连接的 iPhone 并开启[开发者模式](https://docs.expo.dev/guides/ios-developer-mode/)。以上任何一项缺失，都可以跟着 Expo 的 [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/) 走一遍（选择 **Development build → iOS Device**）。

Xcode 会使用你的 Apple ID 自动拥有的 "Personal Team" 签名——首次登录 Xcode 时会静默创建，无需额外配置。首次构建会下载 CocoaPods + 从源码编译 React Native，预计 10–20 分钟；后续构建会复用 Xcode 的缓存。

**如果 Xcode 报 "No matching provisioning profiles found" 拒绝签名**——比较少见，通常是因为有人已经在 Apple Developer Portal 上认领了默认 bundle id `ai.multica.mobile`。换成你自己的反向域名重新跑：

```bash
export EXPO_BUNDLE_IDENTIFIER_PROD=com.yourname.multica
pnpm ios:mobile:device:prod:release
```

**7 天签名限制**：免费 Apple ID 签出的构建只能用 7 天。到期后把 iPhone 重新插上 Mac，重跑上面那条命令重新签名即可。Apple Developer Program 账号（$99/年）可以把这个期限延长到 1 年。

下面这些内容都是给应用开发者看的——如果你只是想装到自己的手机上，可以跳过剩下全部。

## 脚本一览

| 命令 | 说明 | 后端 |
|---|---|---|
| `pnpm dev:mobile` | 只启动 Metro（复用已装好的构建） | local（`.env.development.local`） |
| `pnpm dev:mobile:staging` | 只启动 Metro（复用已装好的构建） | staging（`.env.staging`） |
| `pnpm dev:mobile:prod` | 只启动 Metro（复用已装好的构建） | production（`.env.production`） |
| `pnpm ios:mobile` | **iOS 模拟器** 完整重建 + 安装，Debug | local |
| `pnpm ios:mobile:staging` | **iOS 模拟器** 完整重建 + 安装，Debug | staging |
| `pnpm ios:mobile:prod` | **iOS 模拟器** 完整重建 + 安装，Debug | production |
| `pnpm ios:mobile:device` | **USB iPhone** 完整重建 + 安装，Debug | local |
| `pnpm ios:mobile:device:staging` | **USB iPhone** 完整重建 + 安装，Debug | staging |
| `pnpm ios:mobile:device:staging:release` | **USB iPhone** 完整重建 + 安装，Release（独立） | staging |
| `pnpm ios:mobile:device:prod` | **USB iPhone** 完整重建 + 安装，Debug | production |
| `pnpm ios:mobile:device:prod:release` | **USB iPhone** 完整重建 + 安装，Release（独立） | production |

`dev:*` 只启动 Metro——默认对应的变体已经装到设备上了。`ios:mobile*` 会做完整的原生重建 + 安装。

Bundle id 和显示名随 `APP_ENV` 切换（见 `app.config.ts`），所以 Dev / Staging / Production 三个变体可以在同一台设备或模拟器上共存。

## 首次配置

`.env.staging` 已提交（公开 staging URL）。`.env.development.local` 已被 gitignore，复制一次模板即可：

```bash
cp apps/mobile/.env.example apps/mobile/.env.development.local
# 然后把里面的 EXPO_PUBLIC_API_URL 改成你 Mac 的局域网 IP，例如 http://192.168.1.42:8080
```

如果你的 Apple ID 还没加入 Multica 的 Apple Developer 团队，再把 `EXPO_BUNDLE_IDENTIFIER_DEV` 取消注释并设成你自己的反向域名（例如 `com.yourname.multica.dev`）。这个变量**只**覆盖 dev 变体——staging / production 的 bundle id 刻意不做覆盖，以保证三个变体能共存。

## 构建到 iPhone 上

根据你的使用场景，有两条路径：

### 日常开发（Mac 在手边）

```bash
pnpm ios:mobile:device:staging
```

产物是 **Debug 构建**，内嵌 `expo-dev-launcher`。每次启动 App 都会探测 Mac 上的 Metro 并拉最新的 JS——热重载很方便，但 Mac 睡眠了或者换了 WiFi 就会很难受。

### 独立使用 / "装好就走"（不用一直在 Mac 旁边）

```bash
pnpm ios:mobile:device:staging:release
```

产物是 **Release 构建**。没有 `expo-dev-launcher`，不会探测 Metro，没有 "Downloading…" 加载页——Splash 直入应用，跟 App Store 装的效果一样。代价是每次 JS 变更都得重跑这条命令。

两条路径的前置条件相同：装有 Xcode 的 Mac、Xcode → Settings → Accounts 下已加入的免费 Apple ID、通过 USB 连接并开启开发者模式的 iPhone。缺任何一项都可以跟着 Expo 的 [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/) 走一遍（选 **Development build → iOS Device**）。

任一变体的首次构建都会下载 CocoaPods + 从源码编译 React Native，预计 10–20 分钟；后续构建会复用 Xcode 的 DerivedData 缓存。

## 在 iOS 模拟器上体验（不需要 iPhone）

```bash
pnpm ios:mobile:staging
```

会启动模拟器、构建并安装 dev-client。因为没有签名 / 描述文件这一步，比真机构建更快，迭代效率更高。之后走相同的 `dev:mobile:staging` Metro 流程即可。

## 7 天签名限制（仅真机）

免费 Apple ID 签出的构建——Debug 和 Release 都一样——**只能用 7 天**。到期后 App 会在 iPhone 上拒绝启动。把 iPhone 重新插上 Mac，重跑对应的 `ios:mobile:device*` 脚本重新签名即可。模拟器构建不受影响。唯一能突破真机期限的办法是买 Apple Developer Program 账号（$99/年），可以延长到 1 年。

## 指向不同的后端

修改 `.env.staging`、`.env.production` 或 `.env.development.local`（你正在跑的那个变体）里的 `EXPO_PUBLIC_API_URL`。然后：

- 已安装的 **Debug 构建**：重启 Metro（`pnpm dev:mobile:staging`），让下一次 JS 包带上新的值。
- 已安装的 **Release 构建**：重跑 `ios:mobile:device:staging:release`——这个值在构建时就被打包进了内嵌 bundle。

测试本地后端时，请使用你 Mac 的局域网 IP（`ipconfig getifaddr en0`），而不是 `localhost`。
