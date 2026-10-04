/**
 * Notification preferences subscreen. 6 inbox groups + system_notifications
 * toggle, each backed by an optimistic PATCH /api/notification-preferences.
 *
 * Copy mirrors packages/views/settings/components/notifications-tab.tsx but
 * hardcoded English (mobile has no i18n infra yet). The group labels MUST
 * stay in sync with web — they describe the same server-side semantics,
 * and divergent labels would violate behavioral parity (apps/mobile/CLAUDE.md).
 */
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type {
  NotificationGroupKey,
  NotificationPreferences,
} from "@multica/core/types";
import { Text } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "@/data/workspace-store";
import { notificationPreferenceOptions } from "@/data/queries/notification-preferences";
import { useUpdateNotificationPreferences } from "@/data/mutations/notification-preferences";
import { useT } from "@/lib/i18n/use-translation";

const INBOX_GROUP_KEYS: Array<
  Exclude<NotificationGroupKey, "system_notifications">
> = [
  "assignments",
  "status_changes",
  "comments",
  "mentions",
  "updates",
  "agent_activity",
];

export default function NotificationsSettingsScreen() {
  const t = useT();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { data, isLoading, error } = useQuery(
    notificationPreferenceOptions(wsId),
  );
  const mutation = useUpdateNotificationPreferences();

  const preferences: NotificationPreferences = data?.preferences ?? {};

  const onToggle = (key: NotificationGroupKey, enabled: boolean) => {
    const next: NotificationPreferences = { ...preferences };
    if (enabled) {
      // Default is "all" — omitting the key keeps the object clean.
      delete next[key];
    } else {
      next[key] = "muted";
    }
    mutation.mutate(next);
  };

  const inboxGroups = INBOX_GROUP_KEYS.map((key) => {
    switch (key) {
      case "assignments":
        return { key, label: t.notifications.assignments, description: t.notifications.assignmentsDesc };
      case "status_changes":
        return { key, label: t.notifications.statusChanges, description: t.notifications.statusChangesDesc };
      case "comments":
        return { key, label: t.notifications.comments, description: t.notifications.commentsDesc };
      case "mentions":
        return { key, label: t.notifications.mentions, description: t.notifications.mentionsDesc };
      case "updates":
        return { key, label: t.notifications.issueUpdates, description: t.notifications.issueUpdatesDesc };
      case "agent_activity":
        return { key, label: t.notifications.agentActivity, description: t.notifications.agentActivityDesc };
    }
  });

  const systemEnabled = preferences.system_notifications !== "muted";

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-destructive text-center">
          {t.notifications.loadFailed}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 py-4 gap-6"
    >
      <Section
        title={t.notifications.inboxTitle}
        description={t.notifications.inboxDesc}
      >
        {inboxGroups.map((group, idx) => {
          const enabled = preferences[group.key] !== "muted";
          const isLast = idx === inboxGroups.length - 1;
          return (
            <View key={group.key}>
              <View className="flex-row items-center px-4 py-3 gap-3">
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">
                    {group.label}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {group.description}
                  </Text>
                </View>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => onToggle(group.key, checked)}
                />
              </View>
              {!isLast ? <Separator /> : null}
            </View>
          );
        })}
      </Section>

      <Section
        title={t.notifications.systemTitle}
        description={t.notifications.systemDesc}
      >
        <View className="flex-row items-center px-4 py-3 gap-3">
          <View className="flex-1">
            <Text className="text-base font-medium text-foreground">
              {t.notifications.systemNotifications}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {t.notifications.systemNotificationsDesc}
            </Text>
          </View>
          <Switch
            checked={systemEnabled}
            onCheckedChange={(checked) =>
              onToggle("system_notifications", checked)
            }
          />
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <View className="px-1">
        <Text className="text-xs uppercase tracking-wider text-muted-foreground">
          {title}
        </Text>
        {description ? (
          <Text className="text-xs text-muted-foreground mt-1">
            {description}
          </Text>
        ) : null}
      </View>
      <View className="rounded-md border border-border bg-card overflow-hidden">
        {children}
      </View>
    </View>
  );
}
