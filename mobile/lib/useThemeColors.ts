import { DARK_COLORS, LIGHT_COLORS } from '@/constants/colors';
import { useColorScheme } from 'nativewind';

export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}
