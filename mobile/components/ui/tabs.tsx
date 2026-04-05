import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function Tabs({
  value,
  onValueChange,
  children,
  ...props
}: ViewProps & { value: string; onValueChange: (value: string) => void }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View {...props}>{children}</View>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('flex-row items-center rounded-lg bg-secondary p-1', className)}
      {...props}
    />
  );
}

function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsContext)!;
  const active = ctx.value === value;
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="sm"
      className={cn('flex-1', className)}
      onPress={() => ctx.onValueChange(value)}
    >
      {children}
    </Button>
  );
}

function TabsContent({
  value,
  children,
  ...props
}: ViewProps & { value: string }) {
  const ctx = React.useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <View {...props}>{children}</View>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
