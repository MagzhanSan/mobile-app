import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '../components/CustomText';
import {
  InputItem,
  Button,
  Provider as AntProvider,
  Toast,
  Icon,
} from '@ant-design/react-native';
import { COLORS } from '../consts/colors';
import { useAuth } from '../contexts/auth-context';
import { getNetworkErrorInfo } from '../utils/network-utils';

const AuthScreen = ({ navigation }: { navigation: any }) => {
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Функция валидации email через regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    // Валидация email
    if (!validateEmail(email.trim())) {
      setError('Пожалуйста, введите корректный email адрес');
      return;
    }

    setLoading(true);
    try {
      await authLogin(email, password);
    } catch (error: any) {
      const errorMessage = getNetworkErrorInfo(error);
      setError(errorMessage);
      // Toast.fail(errorMessage, 3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={'padding'} style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Вход в систему</Text>

        <InputItem
          clear
          type="text"
          value={email}
          onChange={value => setEmail(value)}
          placeholder="Email"
          placeholderTextColor={COLORS.placeholder}
          styles={{ input: styles.input }}
        >
          <Icon name="user" color={COLORS.textSecondary} style={styles.icon} />
        </InputItem>

        <InputItem
          clear
          type="password"
          value={password}
          onChange={value => setPassword(value)}
          placeholder="Пароль"
          placeholderTextColor={COLORS.placeholder}
          styles={{ input: styles.input }}
        >
          <Icon name="lock" color={COLORS.textSecondary} style={styles.icon} />
        </InputItem>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          type="primary"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        >
          Войти
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 0,
    paddingLeft: 0,
    marginLeft: -35,
  },
  icon: {
    marginRight: 0,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  forgot: {
    marginTop: 16,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  testButton: {
    marginTop: 12,
    backgroundColor: COLORS.textSecondary,
  },
});

export default AuthScreen;
