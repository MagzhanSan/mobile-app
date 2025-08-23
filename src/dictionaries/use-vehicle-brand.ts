import { useState } from 'react';
import { VehicleBrand } from '../types/types';
import { vehicleBrandsApi } from '../api/vehicle-brands-api';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getVehicleBrands, saveVehicleBrands } from '../utils/offline-storage';

export const useVehicleBrand = () => {
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();

  const fetchVehicleBrands = async () => {
    try {
      if (isOnline === true) {
        setLoading(true);
        setError(null);
        const data = await vehicleBrandsApi.getAll();
        setVehicleBrands(data);
        await saveVehicleBrands(data);
      } else {
        const offlineVehicleBrands = await getVehicleBrands();
        setVehicleBrands(offlineVehicleBrands);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки брендов автомобилей');
      console.error('Error fetching vehicle brands:', err);
      const offlineContracts = await getVehicleBrands();
      setVehicleBrands(offlineContracts);
    } finally {
      setLoading(false);
    }
  };

  const searchVehicleBrands = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleBrandsApi.search(query);
      setVehicleBrands(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка поиска брендов автомобилей');
      console.error('Error searching vehicle brands:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    vehicleBrands,
    loading,
    error,
    load: fetchVehicleBrands,
    search: searchVehicleBrands,
  };
};
