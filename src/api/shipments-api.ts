import { httpClient } from './http-client';
import { Counterparty, Shipment, ShipmentRequest } from '../types/types';
import {
  cacheShipments,
  getCachedShipments,
  cacheShipmentDetails,
  getCachedShipmentDetails,
  getCachedBasicShipmentData,
  hasCachedData,
} from '../utils/cache-utils';
import NetInfo from '@react-native-community/netinfo';

export interface ShipmentsFilters {
  status?: string[];
  driver_id?: number[];
  vehicle_id?: number[];
  field_id?: number[];
  product_id?: number[];
  date_from?: string;
  date_to?: string;
  search?: string;
}

export const shipmentsApi = {
  getShipments: async (status?: string): Promise<{ shipments: Shipment[] }> => {
    const url = `/shipments${status ? `?status=${status}` : ''}`;

    try {
      // Проверяем подключение к интернету
      const netInfo = await NetInfo.fetch();

      if (netInfo.isConnected && netInfo.isInternetReachable) {
        // Есть интернет - делаем запрос к API
        const result = await httpClient.get<{ shipments: Shipment[] }>(url);

        // Кэшируем результат
        await cacheShipments(result.shipments, status);

        // Дополнительно кэшируем все рейсы если фильтр пустой
        if (status === '') {
          await shipmentsApi.cacheAllShipments();
        }

        return result;
      } else {
        // Нет интернета - возвращаем кэшированные данные
        console.log('Нет подключения к интернету, используем кэш');
        const cached = await getCachedShipments();

        if (cached) {
          return { shipments: cached.shipments };
        }

        // Если кэша нет или фильтр не совпадает, возвращаем пустой массив
        return { shipments: [] };
      }
    } catch (error) {
      console.error('Ошибка получения рейсов:', error);

      // При ошибке пытаемся вернуть кэшированные данные
      const cached = await getCachedShipments();
      if (cached) {
        console.log('Возвращаем кэшированные данные из-за ошибки');
        return { shipments: cached.shipments };
      }

      throw error;
    }
  },

  // Получение деталей рейса
  getShipment: async (id: string): Promise<Shipment | null> => {
    try {
      // Проверяем подключение к интернету
      const netInfo = await NetInfo.fetch();

      if (netInfo.isConnected && netInfo.isInternetReachable) {
        // Есть интернет - делаем запрос к API
        const result = await httpClient.get<{ shipment: Shipment }>(
          `/shipments/${id}`,
        );

        if (result.shipment) {
          // Кэшируем детали рейса
          await cacheShipmentDetails(result.shipment);
          return result.shipment;
        }

        return null;
      } else {
        // Нет интернета - возвращаем кэшированные данные
        console.log('Нет подключения к интернету, используем кэш для деталей');

        // Сначала пытаемся получить детальные данные
        const detailedCached = await getCachedShipmentDetails(id);
        if (detailedCached) {
          return detailedCached;
        }

        // Если детальных данных нет, возвращаем базовые данные
        const basicCached = await getCachedBasicShipmentData(id);
        if (basicCached) {
          console.log('Возвращаем базовые данные из кэша');
          return basicCached;
        }

        return null;
      }
    } catch (error) {
      console.error('Ошибка получения деталей рейса:', error);

      // При ошибке пытаемся вернуть кэшированные данные
      const detailedCached = await getCachedShipmentDetails(id);
      if (detailedCached) {
        console.log('Возвращаем кэшированные детали из-за ошибки');
        return detailedCached;
      }

      // Если детальных данных нет, возвращаем базовые данные
      const basicCached = await getCachedBasicShipmentData(id);
      if (basicCached) {
        console.log('Возвращаем базовые данные из-за ошибки');
        return basicCached;
      }

      throw error;
    }
  },

  // Создание рейса
  createShipment: async (data: ShipmentRequest): Promise<Shipment> => {
    const response = await httpClient.post<Shipment>('/shipments', data);
    return response;
  },

  // Обновление рейса
  updateShipment: async (data: ShipmentRequest): Promise<Shipment> => {
    return httpClient.put<Shipment>(`/shipments`, data);
  },

  // Удаление рейса
  deleteShipment: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/shipments/${id}`);
  },

  // Подробная информация по БИНу
  getCounterpartyData: async (bin: string): Promise<Counterparty> => {
    return httpClient.get<Counterparty>(`/counterparty-data`, {
      params: { bin },
    });
  },

  // Проверка наличия кэшированных данных
  hasCachedData: async (): Promise<boolean> => {
    return hasCachedData();
  },

  // Кэширование всех рейсов
  cacheAllShipments: async (): Promise<void> => {
    try {
      const result = await httpClient.get<{ shipments: Shipment[] }>(
        '/shipments',
      );
      await cacheShipments(result.shipments, '');
      console.log('Кэшированы все рейсы');
    } catch (error) {
      console.error('Ошибка кэширования всех рейсов:', error);
    }
  },

  // Кэширование только in_transit рейсов
  cacheInTransitShipments: async (): Promise<void> => {
    try {
      const result = await httpClient.get<{ shipments: Shipment[] }>(
        '/shipments?status=in_transit',
      );
      await cacheShipments(result.shipments, 'in_transit');
      console.log('Кэшированы in_transit рейсы');
    } catch (error) {
      console.error('Ошибка кэширования in_transit рейсов:', error);
    }
  },
};
