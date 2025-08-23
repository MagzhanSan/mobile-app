import React from 'react';
import { Text as RNText, TextInput as RNTextInput, TextProps, TextInputProps } from 'react-native';
import { FONTS } from '../consts/fonts';
import { COLORS } from '../consts/colors';

// Кастомный компонент Text с автоматическим применением шрифтов
export const Text: React.FC<TextProps> = ({ style, ...props }) => {
  return (
    <RNText
      style={[
        {
          fontFamily: FONTS.notoSansRegular,
          color: COLORS.textPrimary,
        },
        style,
      ]}
      {...props}
    />
  );
};

// Кастомный компонент TextInput с автоматическим применением шрифтов
export const TextInput: React.FC<TextInputProps> = ({ style, ...props }) => {
  return (
    <RNTextInput
      style={[
        {
          fontFamily: FONTS.notoSansRegular,
          color: COLORS.textPrimary,
        },
        style,
      ]}
      {...props}
    />
  );
};

// Экспортируем также оригинальные компоненты для случаев, когда нужны стандартные шрифты
export { RNText as OriginalText, RNTextInput as OriginalTextInput };
