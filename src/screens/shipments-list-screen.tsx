import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  List,
  Picker,
  ActivityIndicator,
  Badge,
  Text,
  Toast,
} from '@ant-design/react-native';
import dayjs from 'dayjs';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Shipment } from '../types/types';
import { shipmentsApi } from '../api/shipments-api';
import { COLORS } from '../consts/colors';
import { getNetworkErrorInfo } from '../utils/network-utils';
import { getLastCacheUpdate } from '../utils/cache-utils';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { offlineSyncService } from '../services/offline-sync';

const STATUS_COLOR: Record<string, string> = {
  draft: '#FAAD14',
  in_transit: '#1890FF',
  completed: '#52C41A',
  offline: '#FAAD14',
};

const statusOptions = [
  { label: 'Все статусы', value: '' },
  { label: 'Черновик', value: 'draft' },
  { label: 'В пути', value: 'in_transit' },
  { label: 'Завершён', value: 'completed' },
];

const ShipmentsListScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [cacheInfo, setCacheInfo] = useState<string>('');
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);

  // Используем хук для динамического отслеживания интернета
  const { isOffline, isLoading: isNetworkLoading } = useNetworkStatus();

  // Показываем индикатор офлайн режима только после определенного времени
  useEffect(() => {
    if (!isNetworkLoading && isOffline) {
      const timer = setTimeout(() => {
        setShowOfflineIndicator(true);
      }, 500); // Показываем через 500мс после определения офлайн режима

      return () => clearTimeout(timer);
    } else {
      setShowOfflineIndicator(false);
    }
  }, [isNetworkLoading, isOffline]);

  // Устанавливаем статус "В пути" по умолчанию при офлайн режиме
  useEffect(() => {
    if (isOffline && filterStatus !== 'in_transit') {
      setFilterStatus('in_transit');
    }
  }, [isOffline, filterStatus]);

  const loadShipments = useCallback(
    async (filterStatus: string, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // В офлайн режиме принудительно загружаем только in_transit рейсы
        const effectiveFilterStatus = isOffline ? 'in_transit' : filterStatus;

        const { shipments } = await shipmentsApi.getShipments(
          effectiveFilterStatus,
        );
        setShipments(shipments);
        setLastUpdated(new Date());

        // Получаем информацию о кэше
        const cacheUpdate = await getLastCacheUpdate();
        if (cacheUpdate) {
          setCacheInfo(
            `Актуальные данные обновлены: ${dayjs(cacheUpdate).format(
              'DD.MM.YYYY HH:mm',
            )}`,
          );
        }
      } catch (error: any) {
        const errorMessage = getNetworkErrorInfo(error);
        Toast.fail(errorMessage, 3);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isOffline, isNetworkLoading],
  );

  // Обновляем данные при каждом фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadShipments(filterStatus, true); // true означает, что это обновление при фокусе
    }, [loadShipments, filterStatus]),
  );

  // Подписываемся на завершение синхронизации для обновления списка
  useEffect(() => {
    const handleSyncComplete = () => {
      loadShipments(filterStatus, true);
    };

    offlineSyncService.addSyncCompleteCallback(handleSyncComplete);

    return () => {
      offlineSyncService.removeSyncCompleteCallback(handleSyncComplete);
    };
  }, [loadShipments, filterStatus]);

  const filtered = shipments;

  const renderItem = ({ item }: { item: Shipment }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ShipmentDetails', { id: item.id })}
    >
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.vehicleText}>
            {item.vehicle_brand.name} {item.vehicle_number}
          </Text>
          <View style={styles.badgeContainer}>
            <Badge
              style={[
                styles.badge,
                { backgroundColor: STATUS_COLOR[item.status.value] },
              ]}
              styles={{ text: styles.badgeText }}
              text={item.status.label}
            />
            {/* Пометка "Офлайн" для офлайн рейсов */}
            {item.status.value === 'offline' ? (
              <Badge
                style={[styles.badge, styles.offlineBadge]}
                styles={{ text: styles.offlineBadgeText }}
                text="Офлайн"
              />
            ) : (
              <View />
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Контрагент</Text>
          <Text style={styles.value}>{item.counterparty.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Продукт</Text>
          <Text style={styles.value}>{item.product.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Контракт</Text>
          <Text style={styles.value}>{item.contract.number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Дата</Text>
          <Text style={styles.value}>
            {item.departure_time
              ? dayjs(item.departure_time).format('DD.MM.YYYY')
              : '—'}{' '}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Индикатор офлайн режима - показываем только после задержки */}
      {showOfflineIndicator ? (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>Офлайн режим</Text>
          <Text style={styles.offlineHint}>
            Показываются только рейсы "В пути"
          </Text>
          {cacheInfo ? (
            <Text style={styles.cacheText}>{cacheInfo}</Text>
          ) : (
            <View />
          )}
        </View>
      ) : (
        <View />
      )}

      {/* Фильтр по статусу - скрываем в офлайн режиме */}
      {!isNetworkLoading && !isOffline ? (
        <List style={styles.filterList}>
          <Picker
            data={statusOptions}
            cols={1}
            value={[filterStatus]}
            onChange={val => setFilterStatus(val[0] as string)}
            cascade={false}
            extra="Выбрать"
          >
            <List.Item arrow="horizontal">Фильтр по статусу</List.Item>
          </Picker>
        </List>
      ) : (
        <View />
      )}

      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadShipments(filterStatus, true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {showOfflineIndicator
              ? 'Нет кэшированных рейсов "В пути"'
              : 'Нет рейсов'}
          </Text>
          {showOfflineIndicator ? (
            <Text style={styles.offlineHint}>
              Подключитесь к интернету для просмотра всех рейсов
            </Text>
          ) : (
            <View />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, marginTop: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  offlineIndicator: {
    backgroundColor: '#FFF7E6',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FAAD14',
  },
  offlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D46B08',
  },
  cacheText: {
    fontSize: 12,
    color: '#8C8C8C',
    marginTop: 4,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 24, fontWeight: '600', color: COLORS.primary },
  filterList: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  cardContainer: { marginBottom: 12 },
  card: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleText: { fontSize: 20, fontWeight: '600', color: COLORS.primary },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '500', color: COLORS.card },
  offlineBadge: {
    backgroundColor: '#FFEBE6',
    borderColor: '#FFA39E',
    borderWidth: 1,
    marginLeft: 8,
  },
  offlineBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D43930',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  value: { fontSize: 14, color: COLORS.textPrimary },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  offlineHint: {
    fontSize: 12,
    color: '#8C8C8C',
    marginTop: 4,
  },
});

export default ShipmentsListScreen;
