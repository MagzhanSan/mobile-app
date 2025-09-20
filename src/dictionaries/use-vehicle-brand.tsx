import { useEffect, useState, useCallback } from 'react';
import { VehicleBrand } from '../types/types';
import { vehicleBrandApi } from '../api/vehicle-brand';
import { saveVehicleBrands, getVehicleBrands } from '../utils/offline-storage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const useVehicleBrand = () => {
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  const loadVehicleBrands = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        if (isOnline === true || forceRefresh) {
          // Если есть интернет или принудительное обновление - загружаем с сервера и сохраняем локально
          const brands = await vehicleBrandApi.getVehicleBrands();
          setVehicleBrands(brands);
          await saveVehicleBrands(brands);
        } else if (isOnline === false) {
          // Если точно нет интернета - загружаем из локального хранилища
          const offlineBrands = await getVehicleBrands();
          setVehicleBrands(offlineBrands);
        } else {
          // Если статус не определен (null) - сначала пытаемся с сервера, потом из локального хранилища
          try {
            const brands = await vehicleBrandApi.getVehicleBrands();
            setVehicleBrands(brands);
            await saveVehicleBrands(brands);
          } catch (networkError) {
            console.log(
              'Network error, loading from offline storage:',
              networkError,
            );
            const offlineBrands = await getVehicleBrands();
            setVehicleBrands(offlineBrands);
          }
        }
      } catch (error) {
        console.error('Error loading vehicle brands:', error);
        // При ошибке пытаемся загрузить из локального хранилища
        const offlineBrands = await getVehicleBrands();
        setVehicleBrands(offlineBrands);
      } finally {
        setLoading(false);
      }
    },
    [isOnline],
  );

  useEffect(() => {
    loadVehicleBrands();
  }, [loadVehicleBrands]);

  return { vehicleBrands, loading, refresh: () => loadVehicleBrands(true) };
};
