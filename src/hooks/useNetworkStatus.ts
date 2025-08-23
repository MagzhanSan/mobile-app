import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Получаем начальное состояние
    const getInitialState = async () => {
      setIsLoading(true);
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setIsLoading(false);
    };

    getInitialState();

    // Подписываемся на изменения состояния сети
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isOnline = isConnected && isInternetReachable;
  const isOffline = !isConnected || !isInternetReachable;

  return {
    isConnected,
    isInternetReachable,
    isOnline,
    isOffline,
    isLoading,
  };
};
