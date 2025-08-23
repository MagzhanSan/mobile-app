import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shipment } from '../types/types';
import { getVehicleBrands, getContracts } from './offline-storage';

const CACHE_KEYS = {
  SHIPMENTS: 'cached_shipments',
  SHIPMENT_DETAILS: 'cached_shipment_details_',
  SHIPMENT_BASIC: 'cached_shipment_basic_',
  LAST_UPDATE: 'shipments_last_update',
};

const MAX_CACHED_SHIPMENTS = 20;

export interface CachedShipments {
  shipments: Shipment[];
  lastUpdated: string;
  filterStatus: string;
}

export interface CachedShipmentDetails {
  shipment: Shipment;
  lastUpdated: string;
}

export interface CachedShipmentBasic {
  shipment: Shipment;
  lastUpdated: string;
}

// Сохраняем список рейсов в кэш
export const cacheShipments = async (
  shipments: Shipment[],
  filterStatus: string = '',
): Promise<void> => {
  try {
    // Берем только последние 20 рейсов
    const limitedShipments = shipments.slice(0, MAX_CACHED_SHIPMENTS);

    const cachedData: CachedShipments = {
      shipments: limitedShipments,
      lastUpdated: new Date().toISOString(),
      filterStatus,
    };

    await AsyncStorage.setItem(
      CACHE_KEYS.SHIPMENTS,
      JSON.stringify(cachedData),
    );
    console.log(`Кэшировано ${limitedShipments.length} рейсов`);

    // Также кэшируем базовые данные каждого рейса отдельно
    for (const shipment of limitedShipments) {
      await cacheBasicShipmentData(shipment);
    }
  } catch (error) {
    console.error('Ошибка кэширования рейсов:', error);
  }
};

// Получаем список рейсов из кэша
export const getCachedShipments = async (): Promise<CachedShipments | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.SHIPMENTS);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения кэшированных рейсов:', error);
    return null;
  }
};

// Сохраняем детали конкретного рейса
export const cacheShipmentDetails = async (
  shipment: Shipment,
): Promise<void> => {
  try {
    const cachedData: CachedShipmentDetails = {
      shipment,
      lastUpdated: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      `${CACHE_KEYS.SHIPMENT_DETAILS}${shipment.id}`,
      JSON.stringify(cachedData),
    );
    console.log(`Кэшированы детали рейса ${shipment.id}`);
  } catch (error) {
    console.error('Ошибка кэширования деталей рейса:', error);
  }
};

// Сохраняем базовые данные рейса (из списка)
export const cacheBasicShipmentData = async (
  shipment: Shipment,
): Promise<void> => {
  try {
    const cachedData: CachedShipmentBasic = {
      shipment,
      lastUpdated: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      `${CACHE_KEYS.SHIPMENT_BASIC}${shipment.id}`,
      JSON.stringify(cachedData),
    );
  } catch (error) {
    console.error('Ошибка кэширования базовых данных рейса:', error);
  }
};

// Получаем детали рейса из кэша
export const getCachedShipmentDetails = async (
  id: string,
): Promise<Shipment | null> => {
  try {
    const cached = await AsyncStorage.getItem(
      `${CACHE_KEYS.SHIPMENT_DETAILS}${id}`,
    );
    if (cached) {
      const data: CachedShipmentDetails = JSON.parse(cached);
      return data.shipment;
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения кэшированных деталей рейса:', error);
    return null;
  }
};

// Получаем базовые данные рейса из кэша
export const getCachedBasicShipmentData = async (
  id: string,
): Promise<Shipment | null> => {
  try {
    const cached = await AsyncStorage.getItem(
      `${CACHE_KEYS.SHIPMENT_BASIC}${id}`,
    );
    if (cached) {
      const data: CachedShipmentBasic = JSON.parse(cached);
      return data.shipment;
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения кэшированных базовых данных рейса:', error);
    return null;
  }
};

// Проверяем, есть ли кэшированные данные
export const hasCachedData = async (): Promise<boolean> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.SHIPMENTS);
    return !!cached;
  } catch (error) {
    return false;
  }
};

// Очищаем весь кэш
export const clearCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(
      key =>
        key.startsWith(CACHE_KEYS.SHIPMENTS) ||
        key.startsWith(CACHE_KEYS.SHIPMENT_DETAILS) ||
        key.startsWith(CACHE_KEYS.SHIPMENT_BASIC),
    );
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('Кэш очищен');
  } catch (error) {
    console.error('Ошибка очистки кэша:', error);
  }
};

// Получаем время последнего обновления кэша
export const getLastCacheUpdate = async (): Promise<Date | null> => {
  try {
    const cached = await getCachedShipments();
    return cached ? new Date(cached.lastUpdated) : null;
  } catch (error) {
    return null;
  }
};

// Добавляем офлайн рейс в кэш списка рейсов
export const addOfflineShipmentToCache = async (
  offlineShipment: any,
  userData?: any,
): Promise<void> => {
  try {
    const cached = await getCachedShipments();

    let vehicleBrands: any[] = [];
    let contracts: any[] = [];

    try {
      vehicleBrands = await getVehicleBrands();
      contracts = await getContracts();
    } catch (error) {
      console.log(
        'Ошибка получения словарей, используем значения по умолчанию:',
        error,
      );
    }

    const vehicleBrand = vehicleBrands.find(
      (brand: any) => brand.id === parseInt(offlineShipment.vehicle_brand_id),
    );
    const contract = contracts.find(
      (contract: any) => contract.id === parseInt(offlineShipment.contract_id),
    );

    const shipment: Shipment = {
      id: offlineShipment.id,
      driver_info: offlineShipment.driver_info || '',
      vehicle_number: offlineShipment.vehicle_number || '',
      vehicle_brand: {
        id: parseInt(offlineShipment.vehicle_brand_id) || 0,
        name: vehicleBrand?.name || 'Неизвестно',
      },
      user: {
        id: userData?.id || 0,
        name: userData?.name || 'Офлайн пользователь',
        email: userData?.email || '',
        phone: userData?.phone || '',
        iin: userData?.iin || '',
        role: userData?.role || {
          label: 'Офлайн',
          value: 'offline' as any,
        },
        is_active: userData?.is_active ?? true,
        counterparty: userData?.counterparty || null,
      },
      contract: {
        id: parseInt(offlineShipment.contract_id) || 0,
        guid: '',
        user: {
          id: 0,
          name: '',
          email: '',
          phone: '',
          role: 'offline' as any,
          is_active: true,
        },
        number: contract?.number || 'Офлайн контракт',
        start_date: contract?.start_date || '',
        end_date: contract?.end_date || '',
        is_active: true,
      },
      counterparty: {
        id: userData?.counterparty?.id || 0,
        guid: userData?.counterparty?.guid || '',
        name: userData?.counterparty?.name || 'Офлайн контрагент',
        bin:
          offlineShipment.counterparty_bin || userData?.counterparty?.bin || '',
        is_active: userData?.counterparty?.is_active ?? true,
      },
      product: {
        id: parseInt(offlineShipment.product_id) || 0,
        name: 'Неизвестно', // Убрано получение имени продукта
      },
      receiver: null,
      lab_assistant: null,
      pile_operator: null,
      boom_operator: null,
      consignments: '-',
      action_log: '-',
      departure_time:
        offlineShipment.departure_time || new Date().toISOString(),
      estimated_arrival_time:
        offlineShipment.estimated_arrival_time || new Date().toISOString(),
      actual_arrival_time: null,
      status: {
        label: 'Создано в офлайн: В пути',
        value: 'in_transit',
      },
      boom_number: null,
      pile_number: null,
      gross_weight: null,
      tare_weight: null,
      net_weight: null,
      is_conditioned: null,
      lead_lab_testing: null,
      general_contamination: null,
      sugar_content: null,
      is_active: true,
    };

    console.log('Объект рейса создан, ID:', shipment.id);

    if (cached) {
      console.log('Обновляем существующий кэш...');
      // Добавляем офлайн рейс в начало списка
      const updatedShipments = [shipment, ...cached.shipments];

      // Ограничиваем количество рейсов
      const limitedShipments = updatedShipments.slice(0, MAX_CACHED_SHIPMENTS);

      const updatedCachedData: CachedShipments = {
        shipments: limitedShipments,
        lastUpdated: new Date().toISOString(),
        filterStatus: cached.filterStatus,
      };

      await AsyncStorage.setItem(
        CACHE_KEYS.SHIPMENTS,
        JSON.stringify(updatedCachedData),
      );

      // Также кэшируем базовые данные офлайн рейса
      await cacheBasicShipmentData(shipment);

      console.log(`Офлайн рейс ${shipment.id} добавлен в кэш`);
    } else {
      console.log('Создаем новый кэш...');
      // Если кэша нет, создаем новый с офлайн рейсом
      const newCachedData: CachedShipments = {
        shipments: [shipment],
        lastUpdated: new Date().toISOString(),
        filterStatus: '',
      };

      await AsyncStorage.setItem(
        CACHE_KEYS.SHIPMENTS,
        JSON.stringify(newCachedData),
      );
      await cacheBasicShipmentData(shipment);

      console.log(`Создан новый кэш с офлайн рейсом ${shipment.id}`);
    }
  } catch (error) {
    console.error('Ошибка добавления офлайн рейса в кэш:', error);
    throw error; // Пробрасываем ошибку дальше для обработки в create-screen
  }
};
