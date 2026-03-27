import { View } from 'react-native';
import { useUniwind } from 'uniwind';
import { Text } from '@/components/ui/text';

interface TextMessageBubbleProps {
  content: string;
}

export function TextMessageBubble({ content }: TextMessageBubbleProps) {
  const { colors } = useUniwind();

  return (
    <View className="px-4 py-2">
      <Text className="text-sm text-foreground leading-relaxed">{content}</Text>
    </View>
  );
}
