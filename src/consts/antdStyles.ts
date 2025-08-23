import { StyleSheet } from 'react-native';

// Глобальные стили для убирания бордеров в Ant Design Native
export const antdStyles = StyleSheet.create({
  // Стили для List компонента
  list: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  
  // Стили для List.Item компонента
  listItem: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  
  // Стили для InputItem компонента
  inputItem: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  
  // Стили для Picker компонента
  picker: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  
  // Стили для DatePicker компонента
  datePicker: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  
  // Стили для Button компонента
  button: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  
  // Стили для Form.Item компонента
  formItem: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
});

// Функция для применения стилей без бордеров к любому компоненту
export const removeBorders = (baseStyle: any) => {
  return {
    ...baseStyle,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  };
};
