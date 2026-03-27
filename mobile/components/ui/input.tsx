import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  TextInputProps
>(({ className, placeholderClassName, ...props }, ref) => (
  <TextInput
    ref={ref}
    className={cn(
      "h-12 rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground",
      className
    )}
    placeholderTextColor="hsl(240 5% 64.9%)"
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
