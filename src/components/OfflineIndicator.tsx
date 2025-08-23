import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { Badge } from '@ant-design/react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { offlineSyncService } from '../services/offline-sync';
import { useEffect, useState } from 'react';

interface OfflineIndicatorProps {
  showCount?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showCount = true,
}) => {
  const { isOnline } = useNetworkStatus();
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    const checkOfflineCount = async () => {
      const count = await offlineSyncService.getOfflineCount();
      setOfflineCount(count);
    };

    checkOfflineCount();

    // Проверяем каждые 5 секунд
    const interval = setInterval(checkOfflineCount, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && offlineCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <Badge
          style={[styles.badge, { backgroundColor: '#faad14' }]}
          text="Офлайн"
        />
      )}
      {showCount && offlineCount > 0 && (
        <Badge
          style={[styles.badge, { backgroundColor: '#1890ff' }]}
          text={`${offlineCount}`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
