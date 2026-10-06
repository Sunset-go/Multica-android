#!/usr/bin/env node
/**
 * Cross-platform gradle wrapper for the Android build.
 *
 * Runs `gradlew.bat` on Windows and `./gradlew` on Unix, from
 * apps/mobile/android/, forwarding all CLI args verbatim.
 *
 * Why: pnpm scripts run under cmd.exe on Windows, where `./gradlew`
 * isn't a valid command and `cd android &&` semantics differ. This
 * wrapper detects the platform at runtime so the same package.json
 * scripts work on Windows, macOS, and Linux without `:win` variants
 * in the script table.
 *
 * Usage: node scripts/run-gradle.mjs <gradle-task> [args...]
 *   e.g. node scripts/run-gradle.mjs assembleRelease -PreactNativeArchitectures=arm64-v8a
 *
 * Exit code is the gradle exit code, so CI failures still fail.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(scriptDir, "..");
const androidDir = join(mobileRoot, "android");

const isWindows = process.platform === "win32";
const gradlew = isWindows ? "gradlew.bat" : "./gradlew";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "[run-gradle] no gradle task provided.\n" +
      "Usage: node scripts/run-gradle.mjs <task> [args...]",
  );
  process.exit(1);
}

console.log(`[run-gradle] ${gradlew} ${args.join(" ")}`);
const result = spawnSync(gradlew, args, {
  cwd: androidDir,
  stdio: "inherit",
  shell: isWindows, // .bat needs a shell on Windows; not needed on Unix
  env: process.env,
});

if (result.error) {
  console.error(`[run-gradle] failed to spawn: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
