import { StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  styleCallback: (colors: ReturnType<typeof useTheme>['colors']) => T
) {
  const { colors } = useTheme();
  return StyleSheet.create(styleCallback(colors));
} 