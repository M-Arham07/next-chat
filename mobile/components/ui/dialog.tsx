import { cn } from '@/lib/utils';
import * as React from 'react';
import { Modal, Pressable, View, type ViewProps } from 'react-native';

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const value = {
    open: open ?? internalOpen,
    onOpenChange: onOpenChange ?? setInternalOpen,
  };
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

function DialogTrigger({ children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(DialogContext)!;
  return React.cloneElement(children as React.ReactElement<any>, {
    onPress: () => ctx.onOpenChange(true),
  });
}

function DialogContent({ className, children, ...props }: ViewProps & { className?: string }) {
  const ctx = React.useContext(DialogContext)!;
  return (
    <Modal transparent visible={ctx.open} animationType="fade" onRequestClose={() => ctx.onOpenChange(false)}>
      <Pressable className="flex-1 items-center justify-center bg-black/50 p-4" onPress={() => ctx.onOpenChange(false)}>
        <Pressable
          className={cn('w-full max-w-md rounded-xl border border-border bg-background p-6', className)}
          onPress={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DialogHeader(props: ViewProps) {
  return <View className="mb-4 gap-1" {...props} />;
}

function DialogFooter(props: ViewProps) {
  return <View className="mt-4 flex-row justify-end gap-2" {...props} />;
}

function DialogTitle(props: ViewProps) {
  return <View {...props} />;
}

function DialogDescription(props: ViewProps) {
  return <View {...props} />;
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
