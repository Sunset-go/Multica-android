/**
 * Expo config plugin: package fbjni's own `libc++_shared.so` into the APK.
 *
 * Why this exists
 * ---------------
 * `react-android:0.83.6` ships a `libc++_shared.so` whose export table does
 * NOT contain `__cxa_init_primary_exception`, but fbjni 0.8.1's prebuilt
 * `libfbjni.so` imports that symbol. AGP's native-lib merge keeps one of the
 * two duplicates and RN's copy usually wins, so `dlopen("libfbjni.so")` fails
 * with
 *
 *   java.lang.UnsatisfiedLinkError: dlopen failed: cannot locate symbol
 *     "__cxa_init_primary_exception" referenced by ".../libfbjni.so"
 *
 * and React Native's startup then aborts with
 *
 *   com.facebook.soloader.SoLoaderDSONotFoundError: couldn't find DSO to
 *     load: libfbjni.so
 *
 * (visible in logcat as `FATAL EXCEPTION: main` right after launch).
 *
 * The fix is to overwrite the merged native libs with the `libc++_shared.so`
 * that ships inside fbjni's own AAR — that is the exact build fbjni's
 * `libfbjni.so` was linked against. fbjni's copy exports a strict superset of
 * RN's copy (verified with `llvm-nm`), so nothing else breaks.
 *
 * The plugin only appends an `apply from:` line to the generated
 * `android/app/build.gradle`; all the logic lives in
 * `apps/mobile/scripts/android-fbjni-libcxx.gradle`.
 *
 * `apps/mobile/scripts/patch-gradle.mjs` applies the same override for
 * builds that reuse an already-generated `android/` directory, so both the
 * prebuild path (CI, fresh checkout) and the patch path stay in sync.
 */
const { withAppBuildGradle } = require("expo/config-plugins");

const MARKER = "android-fbjni-libcxx.gradle";

/** Relative to `android/app/` → `apps/mobile/scripts/`. */
const SCRIPT_PATH = "../../scripts/android-fbjni-libcxx.gradle";

function withFbjniLibcxx(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") {
      // The generated app/build.gradle is Groovy; if Expo ever switches the
      // template to Kotlin DSL this plugin must be updated instead of
      // silently doing nothing.
      console.warn(
        "[with-fbjni-libcxx] app/build.gradle is not Groovy — skipping the libc++_shared.so override",
      );
      return cfg;
    }

    const contents = cfg.modResults.contents;
    if (!contents.includes(MARKER)) {
      cfg.modResults.contents = `${contents}\napply from: file("${SCRIPT_PATH}")\n`;
    }
    return cfg;
  });
}

module.exports = withFbjniLibcxx;
