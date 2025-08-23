import { StyleSheet } from 'react-native';
import { FONTS } from './fonts';
import { COLORS } from './colors';

// Глобальные стили для применения шрифтов везде
export const globalStyles = StyleSheet.create({
  // Глобальные стили для всех текстовых элементов
  text: {
    fontFamily: FONTS.notoSansRegular,
    color: COLORS.textPrimary,
  },
  
  // Стили для заголовков
  heading: {
    fontFamily: FONTS.notoSansBold,
    color: COLORS.textPrimary,
  },
  
  // Стили для кнопок
  buttonText: {
    fontFamily: FONTS.notoSansMedium,
  },
  
  // Стили для полей ввода
  input: {
    fontFamily: FONTS.notoSansRegular,
    color: COLORS.textPrimary,
  },
  
  // Стили для подписей
  caption: {
    fontFamily: FONTS.notoSansRegular,
    color: COLORS.textSecondary,
  },
});

// Функция для применения глобальных стилей к существующим стилям
export const applyGlobalFonts = (baseStyles: any) => {
  return StyleSheet.create({
    ...baseStyles,
    // Применяем шрифты ко всем текстовым элементам
    text: {
      ...globalStyles.text,
      ...baseStyles.text,
    },
    title: {
      ...globalStyles.heading,
      ...baseStyles.title,
    },
    heading: {
      ...globalStyles.heading,
      ...baseStyles.heading,
    },
    buttonText: {
      ...globalStyles.buttonText,
      ...baseStyles.buttonText,
    },
    input: {
      ...globalStyles.input,
      ...baseStyles.input,
    },
    caption: {
      ...globalStyles.caption,
      ...baseStyles.caption,
    },
  });
};
