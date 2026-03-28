import React, { createContext, useContext, ReactNode } from "react";
import { useColorScheme, View, StyleSheet } from "react-native";
import { LightColors, DarkColors, ThemeColors } from "@/constants/colors";

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkColors : LightColors;

  // Set CSS variables for NativeWind
  const cssVariables = {
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card": colors.card,
    "--card-foreground": colors.cardForeground,
    "--popover": colors.popover,
    "--popover-foreground": colors.popoverForeground,
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.secondaryForeground,
    "--muted": colors.muted,
    "--muted-foreground": colors.mutedForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.accentForeground,
    "--destructive": colors.destructive,
    "--destructive-foreground": colors.destructiveForeground,
    "--border": colors.border,
    "--input": colors.input,
    "--ring": colors.ring,
    "--message-sent": colors.messageSent,
    "--message-received": colors.messageReceived,
    "--glass-border": colors.glassBorder,
    "--radius": "10px",
  };

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
