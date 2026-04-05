import { cn } from '@/lib/utils';
import { BlurView } from 'expo-blur';
import { Platform, View, type ViewProps } from 'react-native';

interface GlassViewProps extends ViewProps {
  subtle?: boolean;
  className?: string;
}

export function GlassView({
  subtle = false,
  className,
  children,
  ...props
}: GlassViewProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={subtle ? 20 : 40}
        tint="default"
        className={cn(
          subtle
            ? 'border border-white/10 dark:border-white/5'
            : 'border border-white/20 dark:border-white/10',
          className
        )}
        {...props}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      className={cn(
        subtle
          ? 'bg-white/5 dark:bg-white/[0.03] border border-white/10 dark:border-white/5'
          : 'bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
