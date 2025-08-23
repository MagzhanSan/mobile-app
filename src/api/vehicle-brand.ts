import { httpClient } from './http-client';
import { VehicleBrand } from '../types/types';

export const vehicleBrandApi = {
  getVehicleBrands: async (): Promise<VehicleBrand[]> => {
    return httpClient.get<VehicleBrand[]>('/vehicle-brands');
  },
};
