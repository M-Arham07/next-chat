import * as React from 'react';
import { Modal, Pressable, View, type ViewProps } from 'react-native';

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <DropdownMenuContext.Provider value={{ open, setOpen }}>{children}</DropdownMenuContext.Provider>;
}

function DropdownMenuTrigger({ children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(DropdownMenuContext)!;
  return React.cloneElement(children as React.ReactElement<any>, { onPress: () => ctx.setOpen(true) });
}

function DropdownMenuContent({ children }: { children: React.ReactNode } & ViewProps) {
  const ctx = React.useContext(DropdownMenuContext)!;
  return (
    <Modal transparent visible={ctx.open} animationType="fade" onRequestClose={() => ctx.setOpen(false)}>
      <Pressable className="flex-1 bg-black/20" onPress={() => ctx.setOpen(false)}>
        <View className="absolute right-4 top-16 min-w-40 rounded-lg border border-border bg-background p-1">
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

function DropdownMenuItem({
  children,
  onPress,
  className,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}) {
  const ctx = React.useContext(DropdownMenuContext)!;
  return (
    <Pressable
      className={cn('rounded-md px-3 py-2', className)}
      onPress={() => {
        onPress?.();
        ctx.setOpen(false);
      }}
    >
      {children}
    </Pressable>
  );
}

function DropdownMenuSeparator() {
  return <View className="my-1 h-px bg-border" />;
}

import { cn } from '@/lib/utils';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
