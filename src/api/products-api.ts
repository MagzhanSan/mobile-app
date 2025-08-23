import { httpClient } from './http-client';
import { Product } from '../types/types';

export const productsApi = {
  // Получение списка продуктов
  getProducts: async (): Promise<Product[]> => {
    return httpClient.get<Product[]>('/products');
  },

  // Получение продукта по ID
  getProduct: async (id: number): Promise<Product> => {
    return httpClient.get<Product>(`/products/${id}`);
  },

  // Создание продукта
  createProduct: async (data: { name: string; description?: string }): Promise<Product> => {
    return httpClient.post<Product>('/products', data);
  },

  // Обновление продукта
  updateProduct: async (id: number, data: { name: string; description?: string }): Promise<Product> => {
    return httpClient.put<Product>(`/products/${id}`, data);
  },

  // Удаление продукта
  deleteProduct: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/products/${id}`);
  },
}; 