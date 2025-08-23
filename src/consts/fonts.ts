export const FONTS = {
  // Основные шрифты Noto Sans (правильные имена файлов)
  notoSansRegular: 'NotoSans-Regular',
  notoSansBold: 'NotoSans-Bold',
  notoSansMedium: 'NotoSans-Medium',
  notoSansLight: 'NotoSans-Light',
  notoSansItalic: 'NotoSans-Italic',
  
  // Дополнительные веса
  notoSansThin: 'NotoSans-Thin',
  notoSansExtraLight: 'NotoSans-ExtraLight',
  notoSansSemiBold: 'NotoSans-SemiBold',
  notoSansExtraBold: 'NotoSans-ExtraBold',
  notoSansBlack: 'NotoSans-Black',
  
  // Переменные шрифты (если поддерживаются)
  notoSansVariable: 'NotoSans-VariableFont_wdth,wght',
  notoSansItalicVariable: 'NotoSans-Italic-VariableFont_wdth,wght',
} as const;

export type FontFamily = typeof FONTS[keyof typeof FONTS];
