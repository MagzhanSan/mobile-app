import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  ActivityIndicator,
  Badge,
  Toast,
} from '@ant-design/react-native';
import dayjs from 'dayjs';
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { Shipment, Consignment } from '../types/types';
import { RootStackParamList } from '../navigation/stack-navigation';
import { COLORS } from '../consts/colors';
import { shipmentsApi } from '../api/shipments-api';
import QRCodeBottomSheet from '../components/QRCodeBottomSheet';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { offlineSyncService } from '../services/offline-sync';
import { Text } from '../components/CustomText';

const STATUS_COLOR: Record<string, string> = {
  draft: '#F1F5F9',

  in_transit: '#F97317',
  arrived: '#F97317',

  completed: '#22C55E',
  accepted: '#22C55E',
  left: '#22C55E',

  lab_analyzed: '#0DA5E9',
  pile_selected: '#0DA5E9',
  boom_selected: '#0DA5E9',

  offline: '#F87316',
  declined: '#EF4444',
};

type Props = {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'ShipmentDetails'>;
};

const ShipmentDetailsScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<string>('');
  const [showQRSheet, setShowQRSheet] = useState(false);
  const [basicDataOnly, setBasicDataOnly] = useState(false);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);

  const { isOffline, isLoading: isNetworkLoading } = useNetworkStatus();

  useEffect(() => {
    if (!isNetworkLoading && isOffline) {
      const timer = setTimeout(() => {
        setShowOfflineIndicator(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setShowOfflineIndicator(false);
    }
  }, [isNetworkLoading, isOffline]);

  const loadShipmentData = async () => {
    setLoading(true);

    try {
      const shipmentData = await shipmentsApi.getShipment(id);
      setShipment(shipmentData);

      if (isOffline && shipmentData) {
        const hasDetailedData =
          shipmentData.consignments &&
          shipmentData.consignments !== '-' &&
          shipmentData.consignments.length > 0;

        setBasicDataOnly(!hasDetailedData);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipmentData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShipmentData();
    }, []),
  );

  useEffect(() => {
    const handleSyncComplete = () => {
      loadShipmentData();
    };

    offlineSyncService.addSyncCompleteCallback(handleSyncComplete);

    return () => {
      offlineSyncService.removeSyncCompleteCallback(handleSyncComplete);
    };
  }, [loadShipmentData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!shipment) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          {showOfflineIndicator
            ? 'Рейс не найден в кэше'
            : 'Информация о рейсе отсутствует'}
        </Text>
        {showOfflineIndicator ? (
          <Text style={styles.offlineHint}>
            Подключитесь к интернету для загрузки данных
          </Text>
        ) : (
          <View />
        )}
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'offline') {
      return '#FAAD14';
    }
    return STATUS_COLOR[status] || '#999';
  };

  const generateQRCode = () => {
    const qrRequest = {
      counterparty: shipment?.counterparty?.name || '',
      counterparty_bin: shipment.counterparty?.bin || '',
      vehicle_number: shipment.vehicle_number || '',
      vehicle_brand: shipment.vehicle_brand?.name || '',
      driver_info: shipment.driver_info || '',
      contract_number: shipment.contract?.number || '',
      user_id: shipment.user?.id || '',
      prefix: shipment.prefix || '',
    };

    setQrData(JSON.stringify(qrRequest));
    setShowQRSheet(true);
  };

  const renderConsignments = () => {
    return (
      <Card style={{ ...styles.card, paddingBottom: 18 }}>
        <Text style={styles.sectionTitle}>Прицепы</Text>
        {shipment.consignments &&
        Array.isArray(shipment.consignments) &&
        shipment.consignments.length > 0 ? (
          shipment.consignments.map(
            (consignment: Consignment, index: number) => (
              <View key={index} style={styles.consignmentCard}>
                <Text style={styles.consignmentTitle}>Прицеп {index + 1}</Text>
                <View style={styles.weightRow}>
                  <View style={styles.weightItem}>
                    <Text style={styles.weightLabel}>Брутто</Text>
                    <Text style={[styles.weightValue, { color: '#1890ff' }]}>
                      {consignment.gross_weight || '—'} т
                    </Text>
                  </View>
                  <View style={styles.weightItem}>
                    <Text style={styles.weightLabel}>Тара</Text>
                    <Text style={[styles.weightValue, { color: '#52c41a' }]}>
                      {consignment.tare_weight || '—'} т
                    </Text>
                  </View>
                  <View style={styles.weightItem}>
                    <Text style={styles.weightLabel}>Нетто</Text>
                    <Text style={[styles.weightValue, { color: '#fa8c16' }]}>
                      {consignment.net_weight || '—'} т
                    </Text>
                  </View>
                </View>
                {consignment.notes ? (
                  <Text style={styles.notes}>
                    Примечания: {consignment.notes}
                  </Text>
                ) : (
                  <View />
                )}
              </View>
            ),
          )
        ) : (
          <View />
        )}

        <View style={styles.totalWeights}>
          <Text style={styles.totalTitle}>Общие веса:</Text>
          <View style={styles.weightRow}>
            <View style={styles.weightItem}>
              <Text style={styles.weightLabel}>Брутто</Text>
              <Text style={[styles.weightValue, { color: '#1890ff' }]}>
                {shipment.gross_weight
                  ? shipment.gross_weight + ' т'
                  : 'Не указано'}
              </Text>
            </View>

            <View style={styles.weightItem}>
              <Text style={styles.weightLabel}>Тара</Text>
              <Text style={[styles.weightValue, { color: '#52c41a' }]}>
                {shipment.tare_weight
                  ? shipment.tare_weight + ' т'
                  : 'Не указано'}
              </Text>
            </View>

            <View style={styles.weightItem}>
              <Text style={styles.weightLabel}>Нетто</Text>
              <Text style={[styles.weightValue, { color: '#fa8c16' }]}>
                {shipment.net_weight
                  ? shipment.net_weight + ' т'
                  : 'Не указано'}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Индикатор офлайн режима - показываем только после задержки */}
      {showOfflineIndicator ? (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>Офлайн режим</Text>
          {basicDataOnly ? (
            <Text style={styles.offlineHint}>
              Показаны базовые данные. Подключитесь к интернету для полной
              информации.
            </Text>
          ) : (
            <View />
          )}
        </View>
      ) : (
        <View />
      )}

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.content}
          style={styles.scroll}
        >
          {/* <Text style={styles.title}>{JSON.stringify(shipment)}</Text> */}
          {/* Основная информация */}
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>
                {shipment.vehicle_brand?.name || '—'}{' '}
                {shipment.vehicle_number || '—'}
              </Text>

              <View style={styles.badgeContainer}>
                <Badge
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getStatusColor(
                        shipment.status?.value || 'unknown',
                      ),
                    },
                  ]}
                >
                  <Text
                    style={{
                      ...styles.badgeText,
                      color:
                        shipment.status.value === 'draft'
                          ? 'gray'
                          : COLORS.card,
                    }}
                  >
                    {shipment.status.label}
                  </Text>
                </Badge>
                {/* Пометка "Офлайн" для офлайн рейсов */}
                {shipment.status?.value === 'offline' ? (
                  <Badge
                    style={[styles.badge, styles.offlineBadge]}
                    text="Офлайн"
                  />
                ) : (
                  <View />
                )}
              </View>
            </View>

            <View style={styles.itemRow}>
              <Text style={styles.label}>Водитель</Text>
              <Text style={styles.value}>{shipment.driver_info || '—'}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.label}>Контрагент</Text>
              <Text style={styles.value}>
                {shipment.counterparty?.name || '—'}
              </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.label}>Продукт</Text>
              <Text style={styles.value}>{shipment.product?.name || '—'}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.label}>Контракт</Text>
              <Text style={styles.value}>
                {shipment.contract?.number || '—'}
              </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.label}>Время отправления</Text>
              <Text style={styles.value}>
                {shipment.departure_time
                  ? dayjs(shipment.departure_time).format('DD.MM.YYYY HH:mm')
                  : '—'}
              </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.label}>Ожидаемое прибытие</Text>
              <Text style={styles.value}>
                {shipment.estimated_arrival_time
                  ? dayjs(shipment.estimated_arrival_time).format(
                      'DD.MM.YYYY HH:mm',
                    )
                  : '—'}
              </Text>
            </View>
            {shipment.actual_arrival_time ? (
              <View style={styles.itemRow}>
                <Text style={styles.label}>Фактическое прибытие</Text>
                <Text style={styles.value}>
                  {shipment.actual_arrival_time === '-'
                    ? 'Не указано'
                    : dayjs(shipment.actual_arrival_time).format(
                        'DD.MM.YYYY HH:mm',
                      )}
                </Text>
              </View>
            ) : (
              <View />
            )}
            {shipment.status.value === 'declined' &&
            shipment.declined_reason ? (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingBottom: 12,
                }}
              >
                <Text
                  style={{
                    ...styles.label,
                    width: '100%',
                  }}
                >
                  Причина отклонения
                </Text>
                <Text
                  style={{
                    ...styles.value,
                    textAlign: 'left',
                  }}
                >
                  {shipment.declined_reason || '—'}
                </Text>
              </View>
            ) : (
              <View />
            )}
          </Card>

          {!basicDataOnly ? (
            (shipment.general_contamination !== '-' ||
              shipment.sugar_content !== '-' ||
              shipment.lead_lab_testing !== '-') &&
            (shipment.general_contamination ||
              shipment.sugar_content ||
              shipment.lead_lab_testing) ? (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Лабораторные данные</Text>
                {shipment.general_contamination !== '-' &&
                shipment.general_contamination ? (
                  <View style={styles.itemRow}>
                    <Text style={styles.label}>Общая загрязненность</Text>
                    <Text style={styles.value}>
                      {shipment.general_contamination}%
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                {shipment.sugar_content !== '-' && shipment.sugar_content ? (
                  <View style={styles.itemRow}>
                    <Text style={styles.label}>Сахаристость</Text>
                    <Text style={styles.value}>{shipment.sugar_content}%</Text>
                  </View>
                ) : (
                  <View />
                )}
                {shipment.lead_lab_testing !== '-' &&
                shipment.lead_lab_testing ? (
                  <View style={styles.itemRow}>
                    <Text style={styles.label}>Лабораторные испытания</Text>
                    <Text style={styles.value}>
                      {shipment.lead_lab_testing === 'true'
                        ? 'Проведены'
                        : 'Не проведены'}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                {shipment.is_conditioned !== undefined ? (
                  <View style={styles.itemRow}>
                    <Text style={styles.label}>
                      {shipment.is_conditioned
                        ? 'Кондиционный'
                        : 'Некондиционный'}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
              </Card>
            ) : (
              <View />
            )
          ) : (
            <View />
          )}

          {/* Операционные данные - показываем только если есть детальные данные */}
          {!basicDataOnly ? (
            (shipment.boom_number !== '-' && shipment.boom_number) ||
            (shipment.pile_number !== '-' && shipment.pile_number) ? (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Операционные данные</Text>
                {shipment.boom_number ? (
                  <View style={styles.itemRow}>
                    <Text style={styles.label}>Номер бума</Text>
                    <Text style={styles.value}>{shipment.boom_number}</Text>
                  </View>
                ) : (
                  <View />
                )}
                {shipment.pile_number ? (
                  <View style={styles.itemRow}>
                    <Text style={styles.label}>Номер кагата</Text>
                    <Text style={styles.value}>{shipment.pile_number}</Text>
                  </View>
                ) : (
                  <View />
                )}
              </Card>
            ) : (
              <View />
            )
          ) : (
            <View />
          )}

          {/* Прицепы - показываем только если есть детальные данные */}
          {renderConsignments()}

          {/* Отступ для стики кнопки */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Стики кнопка QR-кода */}
        <View style={styles.stickyButtonContainer}>
          <TouchableOpacity style={styles.qrButton} onPress={generateQRCode}>
            <Text style={styles.qrButtonText}>Сгенерировать QR-код</Text>
          </TouchableOpacity>
        </View>
      </View>

      <QRCodeBottomSheet
        prefix={shipment.prefix}
        isVisible={showQRSheet}
        onClose={() => setShowQRSheet(false)}
        qrData={qrData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 16 },
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
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.card,
  },
  offlineHint: {
    fontSize: 12,
    color: '#8C8C8C',
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.card,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 150,
  },
  value: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  qrDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  qrButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  consignmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  consignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weightItem: {
    flex: 1,
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  weightValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  totalWeights: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  totalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  bottomSpacer: {
    height: 80, // Высота для стики кнопки
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineBadge: {
    backgroundColor: '#FFE6CC',
    borderColor: '#D46B08',
    borderWidth: 1,
    marginLeft: 8,
  },
});

export default ShipmentDetailsScreen;
