import { httpClient } from '../api/http-client';

// Проверка подключения к API
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    await httpClient.get('/auth/user');
    return true;
  } catch (error: any) {
    console.error('API connection failed:', error);
    return false;
  }
};

// Получение информации об ошибке сети
export const getNetworkErrorInfo = (error: any): string => {
  if (error.code === 'NETWORK_ERROR') {
    return 'Нет подключения к серверу. Проверьте интернет соединение.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'Превышено время ожидания ответа от сервера.';
  }

  if (error.response?.status === 404) {
    return 'Сервер не найден.';
  }

  return error?.response?.data?.message || 'Неизвестная ошибка сети.';
};

// Проверка доступности сервера
export const pingServer = async (): Promise<{
  success: boolean;
  latency: number;
}> => {
  const startTime = Date.now();

  try {
    await httpClient.get('/auth/user');
    const latency = Date.now() - startTime;
    return { success: true, latency };
  } catch (error) {
    const latency = Date.now() - startTime;
    return { success: false, latency };
  }
};
