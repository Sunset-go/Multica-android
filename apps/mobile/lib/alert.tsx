import { create } from "zustand";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/use-translation";

type AlertButtonStyle = "cancel" | "destructive" | "default";

export interface AlertButtonConfig {
  text: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

export interface AlertConfig {
  title?: string;
  message?: string;
  buttons?: AlertButtonConfig[];
  loading?: boolean;
  /** Optional secondary line shown under the message, e.g. a count. */
  secondary?: string;
  /**
   * Button layout. Default 'horizontal' (buttons share a single row — good
   * for 2–3 short actions). Pass 'vertical' when labels are long or the
   * count is dynamic and would squeeze in one row — e.g. the squad-leader
   * picker (agents list + cancel) or the agent permission-scope picker
   * (private / workspace / members / cancel).
   */
  layout?: "horizontal" | "vertical";
}

interface AlertState {
  config: AlertConfig | null;
  show: (config: AlertConfig) => void;
  close: () => void;
}

const useAlertStore = create<AlertState>((set) => ({
  config: null,
  show: (config) => set({ config }),
  close: () => set({ config: null }),
}));

const MAX_CONTENT_HEIGHT = 520;

export function showAlert(config: AlertConfig): void {
  useAlertStore.getState().show(config);
}

function buttonTextColor(style: AlertButtonStyle | undefined): string {
  if (style === "destructive") return "text-destructive";
  if (style === "cancel") return "text-muted-foreground";
  return "text-foreground";
}

export function AlertHost() {
  const { config, close } = useAlertStore();
  const t = useT();

  if (!config) return null;

  const { title, message, buttons = [], loading, secondary } = config;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={close}
        accessibilityLabel={t.common.close}
      />
      <View className="absolute inset-0 justify-center px-4">
        <View
          className="w-full rounded-2xl border border-border bg-popover overflow-hidden"
          style={{ maxWidth: 400, maxHeight: MAX_CONTENT_HEIGHT }}
        >
          {loading ? (
            <View className="items-center justify-center p-6 gap-2">
              <ActivityIndicator />
              {title ? (
                <Text className="text-sm text-muted-foreground">{title}</Text>
              ) : null}
            </View>
          ) : (
            <>
              <ScrollView
                className="flex-1"
                bounces={false}
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-base text-foreground font-semibold text-center">
                  {title}
                </Text>
                {message ? (
                  <Text className="text-sm text-muted-foreground text-center mt-1">
                    {message}
                  </Text>
                ) : null}
                {secondary ? (
                  <Text className="text-xs text-muted-foreground text-center mt-1">
                    {secondary}
                  </Text>
                ) : null}
              </ScrollView>

              {buttons.length > 0 ? (
                <View
                  className={cn(
                    "gap-2 border-t border-border p-3",
                    config.layout === "vertical" ? "flex-col" : "flex-row",
                  )}
                >
                  {buttons.map((btn, i) => (
                    <Pressable
                      key={i}
                      className={cn(
                        "justify-center items-center py-2.5 px-4 rounded-xl active:bg-secondary",
                        config.layout !== "vertical" && "flex-1",
                      )}
                      onPress={() => {
                        close();
                        btn.onPress?.();
                      }}
                    >
                      <Text
                        className={cn(
                          "text-sm font-medium",
                          buttonTextColor(btn.style),
                        )}
                      >
                        {btn.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View className="flex-row border-t border-border">
                  <Pressable
                    className="flex-1 justify-center items-center py-3 px-4 active:bg-secondary"
                    onPress={close}
                  >
                    <Text className="text-base text-foreground font-semibold">
                      {t.common.ok}
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
