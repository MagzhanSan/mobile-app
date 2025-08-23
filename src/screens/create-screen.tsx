import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  List,
  Picker,
  DatePicker,
  Button,
  Provider as AntProvider,
  InputItem,
  Form,
  WhiteSpace,
  Toast,
  Badge,
  ActivityIndicator,
} from '@ant-design/react-native';
import moment from 'moment';
import uuid from 'react-native-uuid';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import QRCodeBottomSheet from '../components/QRCodeBottomSheet';
import { ShipmentRequest } from '../types/types';

import { COLORS } from '../consts/colors';
import { antdStyles } from '../consts/antdStyles';
import { useAuth } from '../contexts/auth-context';
import { useVehicleBrand } from '../dictionaries/use-vehicle-brand';
import { useContracts } from '../dictionaries/use-contracts';
import { shipmentsApi } from '../api/shipments-api';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { addOfflineShipment } from '../utils/offline-storage';
import { addOfflineShipmentToCache } from '../utils/cache-utils';
import { offlineSyncService } from '../services/offline-sync';
import { Text } from '../components/CustomText';

const CreateShipmentScreen = ({ navigation }: { navigation: any }) => {
  const {
    vehicleBrands,
    loading: vehicleBrandsLoading,
    load: loadVehicleBrands,
  } = useVehicleBrand();
  const {
    contracts,
    loading: contractsLoading,
    load: loadContracts,
  } = useContracts();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [showQRSheet, setShowQRSheet] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  const [form] = Form.useForm();

  // Проверяем количество оффлайн рейсов
  useEffect(() => {
    const checkOfflineCount = async () => {
      const count = await offlineSyncService.getOfflineCount();
      setOfflineCount(count);
    };
    checkOfflineCount();
  }, []);

  // Синхронизируем оффлайн рейсы при появлении интернета
  useEffect(() => {
    if (isOnline === true && offlineCount > 0) {
      offlineSyncService.syncOfflineShipments();
      setOfflineCount(0);
    }
  }, [isOnline, offlineCount]);

  // Перерендериваем страницу каждый раз при фокусе
  useEffect(() => {
    if (isFocused) {
      // Сбрасываем форму при каждом входе на страницу
      form.resetFields();
      setQrData('');
      setShowQRSheet(false);
      
      // Загружаем свежие данные
      loadVehicleBrands();
      loadContracts();
      
      // Обновляем количество оффлайн рейсов
      const checkOfflineCount = async () => {
        const count = await offlineSyncService.getOfflineCount();
        setOfflineCount(count);
      };
      checkOfflineCount();
    }
  }, [isFocused]);

  // Дополнительный useFocusEffect для совместимости
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        loadVehicleBrands();
        loadContracts();
      }
    }, [isFocused]),
  );

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);
      const id = uuid.v4().toString();

      const payload: ShipmentRequest = {
        id,
        counterparty_bin: user?.counterparty?.bin || '',
        contract_id: String(values?.contract) || '',
        driver_info: values?.driverName || '',
        vehicle_brand_id: String(values?.vehicle) || '',
        vehicle_number: values?.vehicle_number || '',
        departure_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        estimated_arrival_time: moment(values?.arrival).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        user_id: user?.id.toString() || '',
      };

      // Дополнительная валидация перед отправкой
      if (!payload.counterparty_bin) {
        Toast.fail('Необходимо указать БИН контрагента');
        return;
      }

      if (!payload.contract_id) {
        Toast.fail('Необходимо указать контракт');
        return;
      }

      if (!payload.driver_info || payload.driver_info.length < 2) {
        Toast.fail('Имя водителя должно содержать минимум 2 символа');
        return;
      }

      if (!payload.vehicle_brand_id) {
        Toast.fail('Необходимо указать марку транспортного средства');
        return;
      }

      if (!payload.vehicle_number || payload.vehicle_number.length < 2) {
        Toast.fail('Гос. номер должен содержать минимум 2 символа');
        return;
      }

      if (payload.vehicle_number.length > 20) {
        Toast.fail('Гос. номер не может быть длиннее 20 символов');
        return;
      }

      if (!payload.departure_time) {
        Toast.fail('Необходимо указать время отправления');
        return;
      }

      if (!payload.estimated_arrival_time) {
        Toast.fail('Необходимо указать предполагаемое время прибытия');
        return;
      }

      // Проверяем, что время прибытия в будущем
      const arrivalTime = moment(payload.estimated_arrival_time);
      if (arrivalTime.isBefore(moment())) {
        Toast.fail('Предполагаемое время прибытия должно быть в будущем');
        return;
      }

      try {
        const qrRequest = {
          id,
          counterparty_bin: user?.counterparty?.bin || '',
          contract_id: String(values?.contract) || '',
          driver_info: values?.driverName || '',
          vehicle_brand_id: String(values?.vehicle) || '',
          vehicle_number: values?.vehicle_number || '',
        };

        setQrData(JSON.stringify(qrRequest));
        setShowQRSheet(true);

        if (isOnline === true) {
          await shipmentsApi.createShipment(payload);
          Toast.success('Рейс создан успешно!');
        } else {
          await addOfflineShipment(payload);
          try {
            await addOfflineShipmentToCache(payload, user);
          } catch (cacheError) {
            console.error('Ошибка добавления в кэш:', cacheError);
          }
          setOfflineCount(prev => prev + 1);
          Toast.info(
            'Рейс сохранен оффлайн. Будет отправлен при появлении интернета.',
          );
        }

        form.resetFields();
      } catch (apiError) {
        console.error('API error:', apiError);

        if (isOnline === true) {
          // Toast.fail('Ошибка при создании рейса');
          setShowQRSheet(false);
          setQrData('');
        } else {
          // Если нет интернета или статус не определен, все равно сохраняем оффлайн
          console.log('API ошибка, сохраняем оффлайн...');
          await addOfflineShipment(payload);
          console.log('Офлайн рейс сохранен, добавляем в кэш...');
          try {
            await addOfflineShipmentToCache(payload, user);
            console.log('Офлайн рейс добавлен в кэш');
          } catch (cacheError) {
            console.error('Ошибка добавления в кэш:', cacheError);
            // Продолжаем работу даже если кэш не обновился
          }
          setOfflineCount(prev => prev + 1);
          Toast.info(
            'Рейс сохранен оффлайн. Будет отправлен при появлении интернета.',
          );
          form.resetFields();
        }
      }
    } catch (validationError) {
      console.error('Form validation error:', validationError);
      Toast.fail('Проверьте правильность заполнения формы');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setQrData('');
    setShowQRSheet(false);
  };

  const calculateNetWeight = (grossWeight: string, tareWeight: string) => {
    if (grossWeight && tareWeight) {
      const gross = parseFloat(grossWeight);
      const tare = parseFloat(tareWeight);
      if (!isNaN(gross) && !isNaN(tare) && gross >= tare) {
        const net = gross - tare;
        form.setFieldsValue({ net_weight: net.toFixed(2) });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Form form={form} style={styles.form}>
          <List style={styles.list}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Водитель *</Text>
              <Form.Item
                name="driverName"
                rules={[
                  { required: true, message: 'Введите имя водителя' },
                  { min: 2, message: 'Имя должно содержать минимум 2 символа' },
                  {
                    max: 255,
                    message: 'Имя не может быть длиннее 255 символов',
                  },
                ]}
              >
                <InputItem
                  clear
                  placeholder="Введите имя водителя"
                  placeholderTextColor={COLORS.placeholder}
                  styles={{ 
                    input: styles.input,
                    container: antdStyles.inputItem 
                  }}
                />
              </Form.Item>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Марка автомобиля *</Text>
              <Form.Item
                name="vehicle"
                rules={[
                  { required: true, message: 'Выберите марку автомобиля' },
                ]}
              >
                {vehicleBrandsLoading ? (
                  <View style={styles.fieldLoadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : vehicleBrands.length > 0 ? (
                  <Picker
                    data={
                      vehicleBrands.length > 0
                        ? vehicleBrands.map(brand => ({
                            label: brand.name,
                            value: brand.id,
                          }))
                        : [{ label: 'Нет данных', value: '' }]
                    }
                    cols={1}
                    disabled={vehicleBrands.length === 0}
                  >
                    <List.Item
                      arrow="horizontal"
                      styles={{ Item: styles.listItem }}
                    />
                  </Picker>
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>
                      {!isOnline ? 'Нет данных (оффлайн режим)' : 'Нет данных'}
                    </Text>
                  </View>
                )}
              </Form.Item>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Номер автомобиля *</Text>
              <Form.Item
                name="vehicle_number"
                rules={[
                  { required: true, message: 'Введите номер автомобиля' },
                  {
                    min: 2,
                    message: 'Номер должен содержать минимум 2 символа',
                  },
                  {
                    max: 20,
                    message: 'Номер не может быть длиннее 20 символов',
                  },
                ]}
              >
                <InputItem
                  clear
                  placeholder="Введите номер автомобиля"
                  placeholderTextColor={COLORS.placeholder}
                  styles={{ 
                    input: styles.input,
                    container: antdStyles.inputItem 
                  }}
                />
              </Form.Item>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Контракт *</Text>
              <Form.Item
                name="contract"
                rules={[{ required: true, message: 'Выберите контракт' }]}
              >
                {contractsLoading ? (
                  <View style={styles.fieldLoadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : contracts.length > 0 ? (
                  <Picker
                    data={
                      contracts.length > 0
                        ? contracts.map(contract => ({
                            label: contract.number,
                            value: contract.id,
                          }))
                        : [{ label: 'Нет данных', value: '' }]
                    }
                    cols={1}
                    loading={loading}
                  >
                    <List.Item
                      arrow="horizontal"
                      styles={{ Item: styles.listItem }}
                    />
                  </Picker>
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>
                      {!isOnline ? 'Нет данных (оффлайн режим)' : 'Нет данных'}
                    </Text>
                  </View>
                )}
              </Form.Item>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Время прибытия *</Text>
              <Form.Item
                name="arrival"
                rules={[{ required: true, message: 'Выберите время прибытия' }]}
              >
                <DatePicker
                  precision="minute"
                  onChange={date => form.setFieldsValue({ arrival: date })}
                  format="DD.MM.YYYY HH:mm"
                >
                  <List.Item
                    arrow="horizontal"
                    styles={{ Item: styles.listItem }}
                  />
                </DatePicker>
              </Form.Item>
            </View>
          </List>
        </Form>

        <WhiteSpace size="lg" />

        <View style={styles.buttonWrapper}>
          <Button
            type="primary"
            onPress={handleSave}
            loading={loading}
            style={styles.button}
          >
            Создать рейс
          </Button>

          <WhiteSpace size="md" />

          <Button type="ghost" onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Очистить форму</Text>
          </Button>
        </View>
      </ScrollView>

      <QRCodeBottomSheet
        isVisible={showQRSheet}
        onClose={() => setShowQRSheet(false)}
        qrData={qrData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  form: {
    marginBottom: 16,
  },
  list: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    paddingTop: 20,
    // Убираем бордеры у List компонента
    borderBottomWidth: 0,
  },
  input: {
    marginBottom: 0,
    paddingLeft: 0,
    // Убираем бордеры у InputItem
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  buttonWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  button: {
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    width: '100%',
  },
  resetButton: {
    borderRadius: 8,
    borderColor: 'gray',
    width: '100%',
  },
  resetButtonText: {
    color: 'gray',
    fontSize: 16,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  offlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  fieldLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  noDataContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  fieldContainer: {
    marginBottom: 0,
    paddingTop: 8
  },
  listItem: {
    paddingVertical: 0,
    textAlign: 'left',
    width: '100%',
    // Убираем бордеры у List.Item
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
});

export default CreateShipmentScreen;
