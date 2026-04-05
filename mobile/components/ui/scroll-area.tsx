import { ScrollView, type ScrollViewProps } from 'react-native';

function ScrollArea(props: ScrollViewProps) {
  return <ScrollView showsVerticalScrollIndicator={false} {...props} />;
}

export { ScrollArea };
