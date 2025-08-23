import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, TextInput } from './CustomText';
import { FONTS } from '../consts/fonts';
import { COLORS } from '../consts/colors';

// Переопределяем компонент Text для автоматического применения шрифтов
const CustomText = (props: any) => {
  const { style, ...restProps } = props;
  
  return (
    <Text
      style={[
        {
          fontFamily: FONTS.notoSansRegular,
          color: COLORS.textPrimary,
        },
        style,
      ]}
      {...restProps}
    />
  );
};

// Переопределяем компонент TextInput для автоматического применения шрифтов
const CustomTextInput = (props: any) => {
  const { style, ...restProps } = props;
  
  return (
    <TextInput
      style={[
        {
          fontFamily: FONTS.notoSansRegular,
          color: COLORS.textPrimary,
        },
        style,
      ]}
      {...restProps}
    />
  );
};

// Компонент-провайдер для применения шрифтов
export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Переопределяем глобальные компоненты
  React.useEffect(() => {
    // Применяем шрифты к глобальным стилям
    const originalText = Text;
    const originalTextInput = TextInput;
    
    // Здесь можно добавить логику для переопределения глобальных компонентов
    // если это необходимо
    
    return () => {
      // Восстанавливаем оригинальные компоненты при размонтировании
    };
  }, []);

  return <>{children}</>;
};

// Экспортируем кастомные компоненты
export { CustomText as Text, CustomTextInput as TextInput };
