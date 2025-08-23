import { COLORS } from './colors';
import { FONTS } from './fonts';

export const STYLES = {
  // Основные текстовые стили
  text: {
    regular: {
      fontFamily: FONTS.notoSansRegular,
      fontSize: 16,
      color: COLORS.textPrimary,
    },
    bold: {
      fontFamily: FONTS.notoSansBold,
      fontSize: 16,
      color: COLORS.textPrimary,
    },
    medium: {
      fontFamily: FONTS.notoSansMedium,
      fontSize: 16,
      color: COLORS.textPrimary,
    },
    light: {
      fontFamily: FONTS.notoSansLight,
      fontSize: 16,
      color: COLORS.textPrimary,
    },
    italic: {
      fontFamily: FONTS.notoSansItalic,
      fontSize: 16,
      color: COLORS.textPrimary,
    },
  },
  
  // Заголовки
  heading: {
    h1: {
      fontFamily: FONTS.notoSansBold,
      fontSize: 24,
      color: COLORS.textPrimary,
    },
    h2: {
      fontFamily: FONTS.notoSansBold,
      fontSize: 20,
      color: COLORS.textPrimary,
    },
    h3: {
      fontFamily: FONTS.notoSansMedium,
      fontSize: 18,
      color: COLORS.textPrimary,
    },
  },
  
  // Кнопки
  button: {
    primary: {
      fontFamily: FONTS.notoSansMedium,
      fontSize: 16,
      color: '#FFFFFF',
    },
    secondary: {
      fontFamily: FONTS.notoSansRegular,
      fontSize: 16,
      color: COLORS.primary,
    },
  },
  
  // Поля ввода
  input: {
    fontFamily: FONTS.notoSansRegular,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  
  // Подписи и мелкий текст
  caption: {
    fontFamily: FONTS.notoSansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // Загрузка
  loading: {
    fontFamily: FONTS.notoSansRegular,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
} as const;
