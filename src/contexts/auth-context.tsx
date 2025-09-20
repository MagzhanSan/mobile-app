import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/types';
import { authApi } from '../api/auth-api';
import {
  saveUserProfile,
  getUserProfile,
  clearUserProfile,
} from '../utils/offline-storage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Toast } from '@ant-design/react-native';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      await AsyncStorage.setItem('access_token', response.data.accessToken);
      await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      await saveUserProfile(response.data.user);

      setUser(response.data.user);
    } catch (error) {
      Alert.alert(
        'Ошибка входа - Кіру сәтсіз',
        (error as any)?.message.includes('401') ? 'Неверный email или пароль\nҚате email немесе құпиясөз' : 'Произошла ошибка\nҚате орын алды'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем локальные данные
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
      await clearUserProfile(); // Очищаем оффлайн профиль
      setUser(null);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      const savedUser = await AsyncStorage.getItem('user');

      if (token && savedUser) {
        // Сначала пытаемся загрузить оффлайн профиль
        const offlineProfile = await getUserProfile();

        if (isOnline === true) {
          // Если есть интернет - проверяем с сервера
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            // Обновляем оффлайн профиль
            await saveUserProfile(currentUser);
          } catch (error) {
            console.error('Auth check error:', error);
            // Если есть интернет и ошибка - очищаем данные
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user');
            await clearUserProfile();
            setUser(null);
          }
        } else {
          // Если нет интернета или статус не определен - используем оффлайн профиль
          if (offlineProfile) {
            setUser(offlineProfile);
          } else {
            // Если нет оффлайн профиля, используем сохраненного пользователя
            setUser(JSON.parse(savedUser));
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // При критической ошибке очищаем все данные
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
      await clearUserProfile();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
