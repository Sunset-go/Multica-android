/**
 * Bottom tab bar — JS `<Tabs>` from expo-router (react-navigation under the
 * hood). We tried NativeTabs first but its `canPreventDefault: false`
 * constraint makes "tap More → open something" impossible. JS Tabs
 * supports `listeners.tabPress + e.preventDefault()`, the canonical RN
 * pattern for tab-as-action.
 *
 * The "More" tab is **not a navigation target** — its press opens a
 * DropdownMenu popover anchored above the tab. The popover is rendered
 * by `<MoreTabDropdownAnchor />` as a sibling of `<Tabs>`, NOT as a
 * `tabBarButton` replacement: keeping the real tab button intact means
 * the icon + "More" label render identically to the other three tabs.
 * We just open the dropdown imperatively from `listeners.tabPress` via
 * the exposed `TriggerRef.open()`.
 *
 * The stub (tabs)/more.tsx file still exists only because expo-router
 * requires every Tabs.Screen to have a backing route file — the press
 * is preventDefault'd so we never actually navigate to it.
 *
 * Active / inactive tint colors are derived from the current colour
 * scheme via THEME so dark mode picks contrasting values automatically.
 */
import { useRef } from "react";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { TriggerRef } from "@rn-primitives/dropdown-menu";
import { useWorkspaceStore } from "@/data/workspace-store";
import { useColorScheme } from "@/lib/use-color-scheme";
import { THEME } from "@/lib/theme";
import { useT } from "@/lib/i18n/use-translation";
import {
  tabBarBottomPadding,
  tabBarContentHeight,
} from "@/lib/tab-bar";
import {
  useInboxUnreadCount,
  useChatUnreadMessageCount,
} from "@/lib/unread-counts";
import { MoreTabDropdownAnchor } from "@/components/nav/more-tab-dropdown";

// Only override backgroundColor — @react-navigation/elements Badge internally
// sets borderRadius = size/2, height = size, minWidth = size, so a single
// character renders as a perfect circle. Overriding minWidth/fontSize here
// breaks that geometry. Text color is auto-derived from backgroundColor
// luminance by Badge itself (white on brand blue).
// NOTE: Badge is used only on the tab bar — the constant below uses the
// default brand color. The badge is a colored dot; visual differences are minor.
const BADGE_STYLE = {
  backgroundColor: THEME.light.brand,
};

/**
 * Custom tab button that vertically centers the icon+label block on
 * Android. React Navigation's default `tabVerticalUiKit` item style is
 * `justifyContent: 'flex-start'`, so the content hugs the top of the tab
 * bar and — with the taller Android content area — leaves an unbalanced
 * gap below. Centering it makes the Inbox / My Issues / Chat / More group
 * sit evenly in the bar's content area, clear of the gesture-navigation
 * pill. iOS keeps the default top-aligned layout (49px content fits the
 * labels without overflow), so the override is Android-only.
 */
function TabBarButton({ style, children, ...rest }: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...rest}
      style={[style, Platform.OS === "android" && { justifyContent: "center" }]}
    >
      {children}
    </PlatformPressable>
  );
}

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const t = useT();
  const tTheme = THEME[colorScheme];
  const insets = useSafeAreaInsets();

  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const inboxUnread = useInboxUnreadCount(wsId);
  const chatUnread = useChatUnreadMessageCount(wsId);

  // Android: taller content area so the fontSize-16 labels fit without
  // overflowing into the gesture-navigation area, plus bottom padding to
  // clear the pill (see lib/tab-bar.ts). iOS keeps React Navigation's
  // default height so landscape compact layout is untouched.
  const bottomPadding = tabBarBottomPadding(insets);
  const contentHeight = tabBarContentHeight();
  const tabBarStyle = {
    backgroundColor: tTheme.background,
    paddingBottom: bottomPadding,
    ...(Platform.OS === "android"
      ? { height: contentHeight + bottomPadding }
      : {}),
  };

  // Truncation aligned with web's sidebar badges: 99+ for both. `undefined`
  // makes React Navigation hide the badge, so zero-count is a free no-op.
  const inboxBadge =
    inboxUnread > 0 ? (inboxUnread > 99 ? "99+" : String(inboxUnread)) : undefined;
  const chatBadge =
    chatUnread > 0 ? (chatUnread > 99 ? "99+" : String(chatUnread)) : undefined;

  // Imperative handle into the More tab's dropdown — listeners.tabPress
  // calls .open(); the @rn-primitives Trigger measures itself inside
  // open() so the popover anchors to MoreTabDropdownAnchor's rect.
  const moreTriggerRef = useRef<TriggerRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: tTheme.foreground,
          tabBarInactiveTintColor: tTheme.mutedForeground,
          tabBarStyle,
          tabBarButton: TabBarButton,
          tabBarLabelStyle: { fontSize: 16 },
        }}
      >
        <Tabs.Screen
          name="inbox"
          options={{
            title: t.tabs.inbox,
            tabBarBadge: inboxBadge,
            tabBarBadgeStyle: BADGE_STYLE,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "documents" : "documents-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="my-issues"
          options={{
            title: t.tabs.myIssues,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "list" : "list-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: t.tabs.chat,
            tabBarBadge: chatBadge,
            tabBarBadgeStyle: BADGE_STYLE,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: t.tabs.more,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="ellipsis-horizontal"
                size={size}
                color={color}
              />
            ),
          }}
          listeners={() => ({
            tabPress: (e) => {
              // Don't navigate to the (stub) /more screen — open the
              // dropdown popover instead. The trigger is invisible and
              // mounted in MoreTabDropdownAnchor below; ref.open() also
              // measures its rect so the popover anchors correctly.
              e.preventDefault();
              moreTriggerRef.current?.open();
            },
          })}
        />
      </Tabs>

      <MoreTabDropdownAnchor triggerRef={moreTriggerRef} />
    </View>
  );
}
