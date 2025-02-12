import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { FONT_SIZES, FONT_WEIGHTS } from '@/constants/theme';

interface CustomTextProps extends TextProps {
  variant?: keyof typeof FONT_SIZES;
  weight?: keyof typeof FONT_WEIGHTS;
}

export function Text({ style, variant = 'md', weight = 'regular', ...props }: CustomTextProps) {
  const { colors } = useTheme();

  return (
    <RNText
      style={[
        {
          color: colors.text,
          fontSize: FONT_SIZES[variant],
          fontWeight: FONT_WEIGHTS[weight],
        },
        style,
      ]}
      {...props}
    />
  );
} 