import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { Text, TextInput } from './src/components/CustomText';
import StackNavigation from './src/navigation/stack-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from '@ant-design/react-native';
import ruRU from '@ant-design/react-native/lib/locale-provider/ru_RU';
import { AuthProvider } from './src/contexts/auth-context';
import { navigationRef } from './src/utils/navigationService';
import SplashScreen from './src/components/SplashScreen';
import { FONTS } from './src/consts/fonts';
import { COLORS } from './src/consts/colors';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки приложения
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 секунды

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Provider locale={ruRU}>
        <View style={styles.container}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          />
          <SplashScreen />
        </View>
      </Provider>
    );
  }

  return (
    <Provider locale={ruRU}>
      <NavigationContainer ref={navigationRef}>
        <AuthProvider>
          <SafeAreaProvider>
            <View style={styles.container}>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              />
              <StackNavigation />
            </View>
          </SafeAreaProvider>
        </AuthProvider>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Глобальные стили для шрифтов
const globalTextStyle = {
  fontFamily: FONTS.notoSansRegular,
  color: COLORS.textPrimary,
};

export default App;
