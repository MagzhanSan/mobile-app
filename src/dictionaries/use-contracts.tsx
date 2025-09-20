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
        const contractsData = await getContracts();
        setContracts(contractsData);
        await saveContracts(contractsData);
      } else if (isOnline === false) {
        const offlineContracts = await getOfflineContracts();
        setContracts(offlineContracts);
      } else {
        try {
          const contractsData = await getContracts();
          setContracts(contractsData);
          await saveContracts(contractsData);
        } catch (networkError) {
          console.log(
            'Network error, loading from offline storage:',
            networkError,
          );
          const offlineContracts = await getOfflineContracts();
          setContracts(offlineContracts);
        }
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      const offlineContracts = await getOfflineContracts();
      setContracts(offlineContracts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return { contracts, loading, load: loadContracts };
};
