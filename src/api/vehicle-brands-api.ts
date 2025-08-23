import { httpClient } from './http-client';
import { VehicleBrand } from '../types/types';

export const vehicleBrandsApi = {
  getAll: async (): Promise<VehicleBrand[]> => {
    const response = await httpClient.get<{ vehicle_brands: VehicleBrand[] }>('/vehicle_brands');
    return response.vehicle_brands;
  },

  getById: async (id: number): Promise<VehicleBrand> => {
    const response = await httpClient.get<VehicleBrand>(`/vehicle_brands/${id}`);
    return response;
  },

  search: async (query: string): Promise<VehicleBrand[]> => {
    const response = await httpClient.get<VehicleBrand[]>(`/vehicle_brands?search=${encodeURIComponent(query)}`);
    return response;
  },
};
