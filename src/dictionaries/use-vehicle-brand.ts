import { useState, useEffect, useCallback } from 'react';
import { VehicleBrand } from '../types/types';
import { vehicleBrandsApi } from '../api/vehicle-brands-api';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getVehicleBrands, saveVehicleBrands } from '../utils/offline-storage';

export const useVehicleBrand = () => {
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, isLoading } = useNetworkStatus();

  const fetchVehicleBrands = async (forceRefresh = false) => {
    if (isLoading) {
      return;
    }
    
    setLoading(true);
    try {
      if (isOnline === true || forceRefresh) {
        setError(null);
        const data = await vehicleBrandsApi.getAll();
        setVehicleBrands(data);
        await saveVehicleBrands(data);
      } else if (isOnline === false) {
        const offlineVehicleBrands = await getVehicleBrands();
        setVehicleBrands(offlineVehicleBrands);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки брендов автомобилей');
      console.error('Error fetching vehicle brands:', err);
      const offlineVehicleBrands = await getVehicleBrands();
      setVehicleBrands(offlineVehicleBrands)
    } finally {
      setLoading(false);
    }
  };

  return {
    vehicleBrands,
    loading,
    error,
    load: fetchVehicleBrands,
  };
};
