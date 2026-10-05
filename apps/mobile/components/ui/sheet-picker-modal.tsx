/**
 * Generic single-select bottom sheet for the cascading agent-edit pickers.
 *
 * Replaces the platform `Alert.alert()`-based pickers on the agent edit
 * page with a card-style bottom sheet that matches the rest of the app:
 * `bg-background` surface, `rounded-t-2xl` top corners, Ionicons,
 * `active:bg-secondary` row highlight, semantic tokens only.
 *
 * Behaviour:
 *   - Tap an item → fire `onSelect(id)` and close the modal.
 *   - Tap backdrop / ✕ close button → close without selecting.
 *   - Optional inline search (pass `searchPlaceholder`).
 *   - Empty state (`emptyMessage`) shown when the list is empty after
 *     filtering.
 *
 * Deliberately kept separate from `MemberPickerModal` (which is
 * multi-select with an explicit Confirm footer). Multi-select needs an
 * explicit commit step; this component is single-select and closes on
 * tap — the two UX patterns don't compose cleanly.
 *
 * Also separate from the formSheet picker routes (issue status/priority,
 * etc.) which are registered in `_layout.tsx` — this modal is used
 * inline by a form, so no cross-route store plumbing is needed.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { THEME } from "@/lib/theme";
import { useColorScheme } from "@/lib/use-color-scheme";

export type SheetPickerItem = {
  /** Stable identifier sent to `onSelect` on tap. */
  id: string;
  /** Primary label (single line, ellipsized). */
  label: string;
  /** Optional secondary description (single line, muted). */
  description?: string;
  /** Optional trailing visual — status dot, badge, icon, etc. */
  trailing?: React.ReactNode;
};

export type SheetPickerModalProps = {
  visible: boolean;
  title: string;
  items: SheetPickerItem[];
  /** Highlight the currently-selected row (radio fill). */
  selectedId?: string | null;
  /** Fired on row tap, immediately followed by `onClose()`. */
  onSelect: (id: string) => void;
  onClose: () => void;
  /** Shows an `ActivityIndicator` in place of the list. */
  loading?: boolean;
  /** Shown when `items` is empty and not loading. */
  emptyMessage?: string;
  /**
   * Opt-in to an inline search bar above the list. Omit for short,
   * categorical pickers (thinking level, service tier) where search
   * would just waste space.
   */
  searchPlaceholder?: string;
};

export function SheetPickerModal({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
  loading = false,
  emptyMessage = "",
  searchPlaceholder,
}: SheetPickerModalProps) {
  const { colorScheme } = useColorScheme();
  const mutedFg = THEME[colorScheme].mutedForeground;
  const [search, setSearch] = useState("");

  const searchable = searchPlaceholder != null;

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        (it.description ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  // Reset the local search box on every open so the sheet always starts
  // with a full list, regardless of what the user typed in a previous
  // session. `visible` is the effect trigger.
  useEffect(() => {
    if (!visible) setSearch("");
  }, [visible]);

  const handleSelect = (id: string) => {
    setSearch("");
    onSelect(id);
    onClose();
  };

  const handleCancel = () => {
    setSearch("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/40" />
      <View className="flex-1" />
      <View className="bg-background rounded-t-2xl flex flex-col max-h-[70%]">
        {/* Header: title + close */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text
            className="text-base font-semibold text-foreground flex-1"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Pressable
            onPress={handleCancel}
            className="size-8 items-center justify-center"
            accessibilityLabel="close"
          >
            <Ionicons name="close" size={20} color={mutedFg} />
          </Pressable>
        </View>
        <Separator />

        {/* Search (optional) */}
        {searchable ? (
          <View className="px-4 py-2">
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={searchPlaceholder}
              placeholderTextColor={mutedFg}
              className="text-base text-foreground rounded-md border border-border bg-background px-3 py-2"
              clearButtonMode="while-editing"
            />
          </View>
        ) : null}

        {/* List */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 380 }}
        >
          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator />
            </View>
          ) : filtered.length === 0 ? (
            <View className="px-4 py-8 items-center">
              <Text className="text-sm text-muted-foreground text-center">
                {emptyMessage}
              </Text>
            </View>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = item.id === selectedId;
              return (
                <View key={item.id}>
                  <Pressable
                    onPress={() => handleSelect(item.id)}
                    className="flex-row items-center px-4 py-3.5 active:bg-secondary gap-3"
                  >
                    <View
                      className={
                        isSelected
                          ? "size-4 rounded-full border-2 border-primary items-center justify-center shrink-0"
                          : "size-4 rounded-full border-2 border-muted-foreground/40 shrink-0"
                      }
                    >
                      {isSelected ? (
                        <View className="size-2 rounded-full bg-primary" />
                      ) : null}
                    </View>
                    <View className="flex-1 min-w-0 gap-0.5">
                      <Text className="text-base text-foreground" numberOfLines={1}>
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text
                          className="text-xs text-muted-foreground"
                          numberOfLines={1}
                        >
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    {item.trailing}
                  </Pressable>
                  {idx < filtered.length - 1 ? <Separator /> : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
