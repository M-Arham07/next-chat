import * as React from "react";
import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

const Text = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
);
Text.displayName = "Text";

export { Text };
