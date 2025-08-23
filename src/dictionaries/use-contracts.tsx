import { useEffect, useState, useCallback } from 'react';
import { Contract } from '../types/types';
import { getContracts } from '../api/contracts';
import {
  saveContracts,
  getContracts as getOfflineContracts,
} from '../utils/offline-storage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  const loadContracts = async (forceRefresh = false) => {
    setLoading(true);
    try {
      if (isOnline === true || forceRefresh) {
        // Если есть интернет или принудительное обновление - загружаем с сервера и сохраняем локально
        const contractsData = await getContracts();
        setContracts(contractsData);
        await saveContracts(contractsData);
      } else {
        // Если нет интернета или статус не определен - загружаем из локального хранилища
        const offlineContracts = await getOfflineContracts();
        setContracts(offlineContracts);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      // При ошибке пытаемся загрузить из локального хранилища
      const offlineContracts = await getOfflineContracts();
      setContracts(offlineContracts);
    } finally {
      setLoading(false);
    }
  };

  return { contracts, loading, load: loadContracts };
};
