import { cn } from '@/lib/utils';
import { View, type ViewProps } from 'react-native';

function Skeleton({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
