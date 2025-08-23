import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { FONTS } from '../consts/fonts';
import { STYLES } from '../consts/styles';

const FontTest = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест шрифтов Noto Sans</Text>
      
      <Text style={[styles.text, { fontFamily: FONTS.notoSansRegular }]}>
        Regular: Привет, мир! Hello, world!
      </Text>
      
      <Text style={[styles.text, { fontFamily: FONTS.notoSansBold }]}>
        Bold: Привет, мир! Hello, world!
      </Text>
      
      <Text style={[styles.text, { fontFamily: FONTS.notoSansMedium }]}>
        Medium: Привет, мир! Hello, world!
      </Text>
      
      <Text style={[styles.text, { fontFamily: FONTS.notoSansLight }]}>
        Light: Привет, мир! Hello, world!
      </Text>
      
      <Text style={[styles.text, { fontFamily: FONTS.notoSansItalic }]}>
        Italic: Привет, мир! Hello, world!
      </Text>
      
      <Text style={STYLES.text.regular}>
        STYLES.regular: Привет, мир! Hello, world!
      </Text>
      
      <Text style={STYLES.text.bold}>
        STYLES.bold: Привет, мир! Hello, world!
      </Text>
      
      <Text style={STYLES.heading.h1}>
        Заголовок H1: Привет, мир! Hello, world!
      </Text>
      
      <Text style={STYLES.heading.h2}>
        Заголовок H2: Привет, мир! Hello, world!
      </Text>
      
      <Text style={STYLES.caption}>
        Подпись: Привет, мир! Hello, world!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
});

export default FontTest;
