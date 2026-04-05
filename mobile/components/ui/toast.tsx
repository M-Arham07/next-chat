import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const listeners = new Set<(options: ToastOptions) => void>();

function emitToast(options: ToastOptions) {
  listeners.forEach((listener) => listener(options));
}

export const toast = {
  error(description: string) {
    emitToast({ title: 'Error', description, variant: 'destructive' });
  },
  success(description: string) {
    emitToast({ title: 'Success', description });
  },
  message(description: string) {
    emitToast({ description });
  },
};

const ToastContext = React.createContext<ToastContextValue>({
  toast: emitToast,
});

export function Toaster() {
  const [items, setItems] = React.useState<Array<ToastOptions & { id: number }>>([]);

  const pushToast = React.useCallback((options: ToastOptions) => {
    const id = Date.now();
    setItems((state) => [...state, { id, ...options }]);
    setTimeout(() => {
      setItems((state) => state.filter((item) => item.id !== id));
    }, 3000);
  }, []);

  React.useEffect(() => {
    listeners.add(pushToast);
    return () => {
      listeners.delete(pushToast);
    };
  }, [pushToast]);

  return (
    <ToastContext.Provider value={{ toast: emitToast }}>
      <View pointerEvents="box-none" className="absolute inset-x-4 top-16 z-50 gap-2">
        {items.map((item) => (
          <View
            key={item.id}
            className={cn(
              'rounded-lg border border-border bg-card p-4 shadow',
              item.variant === 'destructive' && 'border-destructive/30 bg-destructive/10'
            )}
          >
            {item.title ? <Text className="font-semibold">{item.title}</Text> : null}
            {item.description ? <Text className="text-sm text-muted-foreground">{item.description}</Text> : null}
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
