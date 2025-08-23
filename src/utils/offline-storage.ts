import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключи для хранения данных
const STORAGE_KEYS = {
  OFFLINE_SHIPMENTS: 'offline_shipments',
  VEHICLE_BRANDS: 'vehicle_brands',
  CONTRACTS: 'contracts',
  USER_PROFILE: 'user_profile',
  LAST_SYNC: 'last_sync',
};

// Интерфейс для оффлайн рейса
export interface OfflineShipment {
  id: string;
  data: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

// Сохранение данных в локальное хранилище
const saveOfflineData = async (key: string, data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving offline data:', error);
  }
};

// Получение данных из локального хранилища
const getOfflineData = async (key: string): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting offline data:', error);
    return null;
  }
};

// Добавление рейса в оффлайн очередь
export const addOfflineShipment = async (shipmentData: any): Promise<void> => {
  try {
    const offlineShipments =
      (await getOfflineData(STORAGE_KEYS.OFFLINE_SHIPMENTS)) || [];

    const offlineShipment: OfflineShipment = {
      id: shipmentData.id,
      data: shipmentData,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    offlineShipments.push(offlineShipment);
    await saveOfflineData(STORAGE_KEYS.OFFLINE_SHIPMENTS, offlineShipments);
  } catch (error) {
    console.error('Error adding offline shipment:', error);
  }
};

// Получение оффлайн рейсов
export const getOfflineShipments = async (): Promise<OfflineShipment[]> => {
  const shipments = await getOfflineData(STORAGE_KEYS.OFFLINE_SHIPMENTS);
  return shipments || [];
};

// Удаление оффлайн рейса после успешной синхронизации
export const removeOfflineShipment = async (id: string): Promise<void> => {
  try {
    const offlineShipments = await getOfflineShipments();
    const filteredShipments = offlineShipments.filter(
      shipment => shipment.id !== id,
    );
    await saveOfflineData(STORAGE_KEYS.OFFLINE_SHIPMENTS, filteredShipments);
  } catch (error) {
    console.error('Error removing offline shipment:', error);
  }
};

// Обновление статуса оффлайн рейса
export const updateOfflineShipmentStatus = async (
  id: string,
  status: OfflineShipment['status'],
): Promise<void> => {
  try {
    const offlineShipments = await getOfflineShipments();
    const updatedShipments = offlineShipments.map(shipment =>
      shipment.id === id ? { ...shipment, status } : shipment,
    );
    await saveOfflineData(STORAGE_KEYS.OFFLINE_SHIPMENTS, updatedShipments);
  } catch (error) {
    console.error('Error updating offline shipment status:', error);
  }
};

// Сохранение марки автомобилей
export const saveVehicleBrands = async (brands: any[]): Promise<void> => {
  await saveOfflineData(STORAGE_KEYS.VEHICLE_BRANDS, brands);
  await saveOfflineData(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
};

// Получение марки автомобилей
export const getVehicleBrands = async (): Promise<any[]> => {
  const brands = await getOfflineData(STORAGE_KEYS.VEHICLE_BRANDS);
  return brands || [];
};

// Сохранение контрактов
export const saveContracts = async (contracts: any[]): Promise<void> => {
  await saveOfflineData(STORAGE_KEYS.CONTRACTS, contracts);
  await saveOfflineData(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
};

// Получение контрактов
export const getContracts = async (): Promise<any[]> => {
  const contracts = await getOfflineData(STORAGE_KEYS.CONTRACTS);
  return contracts || [];
};

// Получение времени последней синхронизации
export const getLastSync = async (): Promise<string | null> => {
  return await getOfflineData(STORAGE_KEYS.LAST_SYNC);
};

// Сохранение профиля пользователя
export const saveUserProfile = async (profile: any): Promise<void> => {
  await saveOfflineData(STORAGE_KEYS.USER_PROFILE, profile);
  await saveOfflineData(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
};

// Получение профиля пользователя
export const getUserProfile = async (): Promise<any> => {
  const profile = await getOfflineData(STORAGE_KEYS.USER_PROFILE);
  return profile || null;
};

// Очистка профиля пользователя (при логауте)
export const clearUserProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  } catch (error) {
    console.error('Error clearing user profile:', error);
  }
};
