import { Alert } from 'react-native';
import { Toast } from '@ant-design/react-native';
import {
  getBilingualMessage,
  getTranslation,
  TRANSLATIONS,
} from '../consts/translations';

// Типы для уведомлений
type NotificationType = 'success' | 'error' | 'warning' | 'info';
type TranslationKey = keyof typeof TRANSLATIONS;

// Функция для показа двуязычного Alert
export const showBilingualAlert = (
  titleKey: TranslationKey,
  messageKey: TranslationKey,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>,
) => {
  const title = getBilingualMessage(titleKey);
  const message = getBilingualMessage(messageKey);

  Alert.alert(title, message, buttons);
};

// Функция для показа двуязычного Toast
export const showBilingualToast = (
  messageKey: TranslationKey,
  type: NotificationType = 'info',
  duration: number = 3,
) => {
  const message = getBilingualMessage(messageKey);

  switch (type) {
    case 'success':
      Toast.success(message, duration);
      break;
    case 'error':
      Toast.fail(message, duration);
      break;
    case 'warning':
      Toast.offline(message, duration);
      break;
    case 'info':
    default:
      Toast.info(message, duration);
      break;
  }
};

// Функция для показа простого Alert с двуязычным заголовком
export const showSimpleAlert = (
  titleKey: TranslationKey,
  message: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>,
) => {
  const title = getBilingualMessage(titleKey);
  Alert.alert(title, message, buttons);
};

// Функция для показа простого Toast с двуязычным сообщением
export const showSimpleToast = (
  messageKey: TranslationKey,
  type: NotificationType = 'info',
  duration: number = 3,
) => {
  const message = getBilingualMessage(messageKey);

  switch (type) {
    case 'success':
      Toast.success(message, duration);
      break;
    case 'error':
      Toast.fail(message, duration);
      break;
    case 'warning':
      Toast.offline(message, duration);
      break;
    case 'info':
    default:
      Toast.info(message, duration);
      break;
  }
};

// Функция для показа подтверждения
export const showConfirmDialog = (
  titleKey: TranslationKey,
  messageKey: TranslationKey,
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  const title = getBilingualMessage(titleKey);
  const message = getBilingualMessage(messageKey);
  const yesText = getBilingualMessage('yes');
  const noText = getBilingualMessage('no');

  Alert.alert(title, message, [
    {
      text: noText,
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: yesText,
      onPress: onConfirm,
    },
  ]);
};

// Функция для показа ошибки сети
export const showNetworkError = () => {
  showBilingualToast('networkError', 'error');
};

// Функция для показа ошибки сервера
export const showServerError = () => {
  showBilingualToast('serverError', 'error');
};

// Функция для показа успешного сохранения
export const showSaveSuccess = () => {
  showBilingualToast('dataSaved', 'success');
};

// Функция для показа успешного обновления
export const showUpdateSuccess = () => {
  showBilingualToast('dataUpdated', 'success');
};

// Функция для показа предупреждения о несохраненных изменениях
export const showUnsavedChangesWarning = (
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  showConfirmDialog('warning', 'unsavedChanges', onConfirm, onCancel);
};

// Функция для показа подтверждения удаления
export const showDeleteConfirm = (
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  showConfirmDialog('confirm', 'deleteConfirm', onConfirm, onCancel);
};

// Функция для показа подтверждения выхода
export const showLogoutConfirm = (
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  showConfirmDialog('confirm', 'logoutConfirm', onConfirm, onCancel);
};

// Функция для показа ошибки валидации
export const showValidationError = (fieldKey?: TranslationKey) => {
  if (fieldKey) {
    const fieldMessage = getBilingualMessage(fieldKey);
    showBilingualAlert('error', 'validationError');
  } else {
    showBilingualToast('validationError', 'error');
  }
};

// Функция для показа ошибки разрешений
export const showPermissionError = () => {
  showBilingualToast('permissionError', 'error');
};

// Функция для показа ошибки камеры
export const showCameraError = () => {
  showBilingualToast('cameraError', 'error');
};

// Функция для показа успешного создания рейса
export const showShipmentCreated = () => {
  showBilingualToast('shipmentCreated', 'success');
};

// Функция для показа успешного обновления рейса
export const showShipmentUpdated = () => {
  showBilingualToast('shipmentUpdated', 'success');
};

// Функция для показа успешного удаления рейса
export const showShipmentDeleted = () => {
  showBilingualToast('shipmentDeleted', 'success');
};

// Функция для показа успешного входа
export const showLoginSuccess = () => {
  showBilingualToast('loginSuccess', 'success');
};

// Функция для показа успешного выхода
export const showLogoutSuccess = () => {
  showBilingualToast('logoutSuccess', 'success');
};

// Функция для показа успешной генерации QR-кода
export const showQRGenerated = () => {
  showBilingualToast('qrGenerated', 'success');
};

// Функция для показа успешного сканирования QR-кода
export const showQRScanned = () => {
  showBilingualToast('qrScanned', 'success');
};

// Функция для показа успешного сохранения фото
export const showPhotoSaved = () => {
  showBilingualToast('photoSaved', 'success');
};

// Функция для показа успешной очистки кэша
export const showCacheCleared = () => {
  showBilingualToast('cacheCleared', 'success');
};

// Функция для показа завершения синхронизации
export const showSyncCompleted = () => {
  showBilingualToast('syncCompleted', 'success');
};

// Функция для показа офлайн режима
export const showOfflineMode = () => {
  showBilingualToast('offlineMode', 'warning');
};

// Функция для показа отсутствия интернета
export const showNoInternetConnection = () => {
  showBilingualToast('noInternetConnection', 'warning');
};

// Функция для показа недоступности сервера
export const showServerUnavailable = () => {
  showBilingualToast('serverUnavailable', 'error');
};
