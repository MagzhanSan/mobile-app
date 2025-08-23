import { httpClient } from './http-client';
import { Driver, Vehicle, Field, Product, Contract } from '../types/types';

export const dictionariesApi = {
  // Водители
  getDrivers: async (): Promise<Driver[]> => {
    return httpClient.get<Driver[]>('/drivers');
  },

  // Транспорт
  getVehicles: async (): Promise<Vehicle[]> => {
    return httpClient.get<Vehicle[]>('/vehicles');
  },

  // Поля
  getFields: async (): Promise<Field[]> => {
    return httpClient.get<Field[]>('/fields');
  },

  // Продукты
  getProducts: async (): Promise<Product[]> => {
    return httpClient.get<Product[]>('/products');
  },

  // Контракты
  getContracts: async (): Promise<Contract[]> => {
    return httpClient.get<Contract[]>('/contracts');
  },
};
