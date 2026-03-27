import * as React from "react";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { Text } from "./text";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive",
        outline: "border border-border bg-transparent",
        ghost: "bg-transparent",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-9 px-4",
        lg: "h-14 px-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

const buttonTextVariants = cva("text-sm font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

interface ButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  label?: string;
}

const Button = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ButtonProps
>(({ className, variant, size, label, children, ...props }, ref) => (
  <TouchableOpacity
    ref={ref}
    className={cn(buttonVariants({ variant, size }), className)}
    activeOpacity={0.8}
    {...props}
  >
    {label ? (
      <Text className={cn(buttonTextVariants({ variant }))}>{label}</Text>
    ) : (
      children
    )}
  </TouchableOpacity>
));
Button.displayName = "Button";

export { Button, buttonVariants };
