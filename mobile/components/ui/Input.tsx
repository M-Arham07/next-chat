import React, { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

/**
 * Input — Native equivalent of shadcn/ui Input.
 * Replaces: HTML <input> element
 * Why: React Native uses <TextInput> instead of HTML inputs.
 * Closest match: same styling, same rounded-md border approach.
 */
export interface InputProps extends TextInputProps {
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base text-foreground",
          "placeholder:text-muted-foreground",
          className
        )}
        placeholderTextColor="#a6a6a6"
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
