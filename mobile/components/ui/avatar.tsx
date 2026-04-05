import { cn } from '@/lib/utils';
import * as React from 'react';
import { Image, View, type ImageProps, type ViewProps } from 'react-native';

function Avatar({ className, ...props }: ViewProps & { alt?: string }) {
  return (
    <View
      className={cn('relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: ImageProps & { className?: string }) {
  return <Image className={cn('h-full w-full', className)} {...props} />;
}

function AvatarFallback({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
