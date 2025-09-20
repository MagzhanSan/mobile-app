// Тестовый файл для проверки работы двуязычных уведомлений
import {
  showBilingualToast,
  showBilingualAlert,
  showUpdateSuccess,
} from './notifications';

// Функция для тестирования всех типов уведомлений
export const testAllNotifications = () => {
  // Тест Toast уведомлений
  showBilingualToast('success', 'success');
  showBilingualToast('error', 'error');
  showBilingualToast('warning', 'warning');
  showBilingualToast('info', 'info');

  // Тест Alert уведомлений
  showBilingualAlert('success', 'dataUpdated');
  showBilingualAlert('error', 'networkError');
  showBilingualAlert('warning', 'offlineMode');
  showBilingualAlert('info', 'loading');

  // Тест специальных функций
  showUpdateSuccess();
};

// Функция для тестирования конкретного типа уведомлений
export const testSpecificNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
) => {
  switch (type) {
    case 'success':
      showBilingualToast('dataSaved', 'success');
      break;
    case 'warning':
      showBilingualToast('offlineMode', 'warning');
      break;
    case 'info':
      showBilingualToast('loading', 'info');
      break;
  }
};
