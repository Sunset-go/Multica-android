/**
 * MoreTabDropdownAnchor — the dropdown that opens when the More tab is tapped.
 *
 * Custom RN implementation: Modal + absolutely-positioned card. Replaces the
 * previous @rn-primitives DropdownMenu which rendered with Android's default
 * Material popup look (rounded-md + thin border + subtle shadow) — the user
 * wanted a fully custom card so the app's visual language (rounded-2xl, no
 * border, elevated shadow, matching agent-picker-sheet / action-sheet) is
 * preserved across platforms.
 *
 * Layout:
 *   - `<Modal transparent animationType="fade">` — full-screen fade layer.
 *   - Backdrop: `<Pressable className="flex-1 bg-black/30">` — subtle dim
 *     so the underlying content reads as context (not fully blacked out),
 *     and tap-to-dismiss matches iOS/Android menu conventions.
 *   - Card: `<View>` positioned absolute above the tab bar, right-aligned to
 *     sit over the More tab. The inner `<Pressable onPress={() => {}}>`
 *     swallows taps inside the card so they don't fall through to the
 *     backdrop. Card shape: `bg-popover rounded-2xl overflow-hidden
 *     shadow-2xl` — no border, matching agent-picker-sheet.
 *
 * Trigger: controlled by the parent `(tabs)/_layout.tsx` via `open`/`onClose`
 * props. The More tab's `tabPress` handler sets `open=true`; no imperative
 * `TriggerRef` needed.
 *
 * Visual conventions (apps/mobile/CLAUDE.md):
 *   - All glyphs are Ionicons via @expo/vector-icons — cross-platform so
 *     they render on both iOS and Android.
 *   - All colours route through THEME tokens, so dark mode is automatic.
 *   - Workspace is a single collapsed row: current workspace name + chevron;
 *     tapping pushes `/${slug}/switch-workspace`, a formSheet that lists
 *     every workspace with an iOS `Alert.alert` confirm step. Single-workspace
 *     users get a disabled row with no chevron.
 *   - Navigation items use `bg-secondary/70` for the active state — softer
 *     than the plain `bg-secondary` used elsewhere so the menu doesn't feel
 *     heavy on a wide phone.
 */
import { useMemo } from "react";
import { Image, Modal, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Workspace } from "@multica/core/types";
import { Text } from "@/components/ui/text";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import { workspaceListOptions } from "@/data/queries/workspaces";
import { useAuthStore } from "@/data/auth-store";
import { useWorkspaceStore } from "@/data/workspace-store";
import { useColorScheme } from "@/lib/use-color-scheme";
import { tabBarBottomPadding, tabBarContentHeight } from "@/lib/tab-bar";
import { THEME } from "@/lib/theme";
import { useT } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type MoreLabelKey =
  | "pinned"
  | "issues"
  | "projects"
  | "agents"
  | "teams";

interface NavItem {
  labelKey: MoreLabelKey;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "pinned", icon: "bookmark-outline", path: "/more/pins" },
  { labelKey: "issues", icon: "list-outline", path: "/more/issues" },
  { labelKey: "projects", icon: "albums-outline", path: "/more/projects" },
  { labelKey: "agents", icon: "person-circle-outline", path: "/more/agents" },
  { labelKey: "teams", icon: "people-outline", path: "/more/squads" },
];

const CARD_WIDTH = 320;
const CARD_GAP_FROM_TAB = 8;
const CARD_RIGHT_INSET = 12;

export function MoreTabDropdownAnchor({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const slug = useWorkspaceStore((s) => s.currentWorkspaceSlug);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();
  const t = useT();
  const tMore = t.more;
  const tTheme = THEME[colorScheme];
  const currentWorkspace = useCurrentWorkspace(slug);
  const workspaceCount = useQuery(workspaceListOptions()).data?.length ?? 0;

  const navigate = (path: string) => {
    if (!slug) return;
    onClose();
    router.push(`/${slug}${path}`);
  };

  const isActive = (path: string) => {
    if (!slug) return false;
    const target = `/${slug}${path}`;
    return pathname === target || pathname.startsWith(target + "/");
  };

  const cardPosition = {
    position: "absolute" as const,
    right: CARD_RIGHT_INSET,
    bottom:
      tabBarBottomPadding(insets) + tabBarContentHeight() + CARD_GAP_FROM_TAB,
    width: CARD_WIDTH,
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable className="flex-1 bg-black/30" onPress={onClose}>
        <View style={cardPosition}>
          <Pressable
            onPress={() => {}}
            className="bg-popover rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Account row — avatar + name + email + chevron → settings. */}
            <MenuRow
              onPress={() => navigate("/more/settings")}
              className="px-3 py-2.5"
              accessibilityLabel={tMore.accountSettings}
            >
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="size-10 rounded-full bg-muted"
                />
              ) : (
                <View className="size-10 rounded-full bg-muted items-center justify-center">
                  <Text className="text-sm font-medium text-muted-foreground">
                    {(user?.name ?? user?.email ?? "U")
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="flex-1 min-w-0 ml-3">
                <Text
                  className="text-base font-medium text-foreground"
                  numberOfLines={1}
                >
                  {user?.name ?? "—"}
                </Text>
                {user?.email ? (
                  <Text
                    className="text-sm text-muted-foreground mt-0.5"
                    numberOfLines={1}
                  >
                    {user.email}
                  </Text>
                ) : null}
              </View>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={tTheme.mutedForeground}
              />
            </MenuRow>

            <CardDivider />

            {/* Workspace row — current workspace, chevron → switch sheet. */}
            <MenuRow
              onPress={() => navigate("/switch-workspace")}
              disabled={workspaceCount <= 1}
              className="px-3 py-2.5"
              accessibilityLabel={
                workspaceCount > 1
                  ? tMore.switchWorkspace
                  : (currentWorkspace?.name ?? tMore.workspace)
              }
            >
              <WorkspaceAvatar
                name={currentWorkspace?.name ?? tMore.workspace}
                avatarUrl={currentWorkspace?.avatar_url}
                size={40}
              />
              <Text
                className="text-base font-medium text-foreground flex-1 min-w-0 ml-3"
                numberOfLines={1}
              >
                {currentWorkspace?.name ?? tMore.workspace}
              </Text>
              {workspaceCount > 1 ? (
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={tTheme.mutedForeground}
                />
              ) : null}
            </MenuRow>

            <CardDivider />

            {/* Navigation items. */}
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <MenuRow
                  key={item.path}
                  onPress={() => navigate(item.path)}
                  className={cn("px-3 py-2.5", active && "bg-secondary/70")}
                  accessibilityLabel={tMore[item.labelKey]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={tTheme.foreground}
                  />
                  <Text
                    className="text-base text-foreground flex-1 min-w-0 ml-3"
                    numberOfLines={1}
                  >
                    {tMore[item.labelKey]}
                  </Text>
                </MenuRow>
              );
            })}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

/**
 * Row inside the card. Padding is set by the caller via `className` because
 * account / workspace rows want slightly different density (both are h-12-ish,
 * nav items a touch tighter). The base class keeps the tap target and
 * touch feedback consistent.
 */
function MenuRow({
  onPress,
  disabled,
  className,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  accessibilityLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "flex-row items-center active:bg-secondary",
        disabled && "opacity-50",
        className,
      )}
    >
      {children}
    </Pressable>
  );
}

function CardDivider() {
  return <View className="h-px bg-border/70" />;
}

function useCurrentWorkspace(slug: string | null): Workspace | undefined {
  const { data } = useQuery(workspaceListOptions());
  return useMemo(
    () => (slug ? data?.find((w) => w.slug === slug) : undefined),
    [data, slug],
  );
}
