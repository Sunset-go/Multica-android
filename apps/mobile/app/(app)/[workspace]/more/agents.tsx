import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useLanguageStore } from "@/data/language-store";

export default function AgentsPage() {
  const locale = useLanguageStore((s) => s.locale);
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-sm text-muted-foreground text-center">
        {locale === "zh" ? "智能体功能即将上线。" : "Agents coming soon."}
      </Text>
    </View>
  );
}
