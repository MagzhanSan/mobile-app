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
  Form,
  WhiteSpace,
  Toast,
  Badge,
  ActivityIndicator,
  Input,
} from '@ant-design/react-native';
import moment from 'moment';
import uuid from 'react-native-uuid';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import QRCodeBottomSheet from '../components/QRCodeBottomSheet';
import ShipmentConfirmationModal from '../components/ShipmentConfirmationModal';
import VehicleBrandSelector from '../components/VehicleBrandSelector';
import { ShipmentRequest } from '../types/types';

import { COLORS } from '../consts/colors';
import { antdStyles } from '../consts/antdStyles';
import { useAuth } from '../contexts/auth-context';
import { useVehicleBrand } from '../dictionaries/use-vehicle-brand';
import { useContracts } from '../dictionaries/use-contracts';
import { shipmentsApi } from '../api/shipments-api';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
  addOfflineShipment,
  getOfflineShipments,
} from '../utils/offline-storage';
import {
  addOfflineShipmentToCache,
  addShipmentToCache,
  getLastCacheUpdate,
} from '../utils/cache-utils';
import { offlineSyncService } from '../services/offline-sync';
import { Text } from '../components/CustomText';
import { timePicker } from '../consts/timepickert';
import {
  showBilingualToast,
  showValidationError,
  showShipmentCreated,
  showNetworkError,
} from '../utils/notifications';
import { getNetworkErrorInfo } from '../utils/network-utils';

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
  const { isOnline, isLoading } = useNetworkStatus();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [showQRSheet, setShowQRSheet] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState<string>('');
  const [selectedVehicleBrandName, setSelectedVehicleBrandName] =
    useState<string>('');
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [selectedContractNumber, setSelectedContractNumber] =
    useState<string>('');
  const [selectedArrivalTime, setSelectedArrivalTime] = useState<string>('');
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [shipmentCount, setShipmentCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [form] = Form.useForm();

  const loadShipments = async () => {
    try {
      setRefreshing(true);
      // Загружаем все рейсы без фильтра статуса
      const { shipments } = await shipmentsApi.getShipments('');
      setShipmentCount(shipments.length);
    } catch (error: any) {
      const errorMessage = getNetworkErrorInfo(error);
      showNetworkError();
    } finally {
      setRefreshing(false);
    }
  };

  // Получаем актуальное количество рейсов (только онлайн, без офлайн)
  const getActualShipmentCount = async (): Promise<number> => {
    try {
      // Получаем только онлайн рейсы
      const { shipments } = await shipmentsApi.getShipments('');
      const onlineCount = shipments.length;
      
      console.log('📊 Подсчет рейсов (только онлайн):', {
        onlineCount,
        note: 'Офлайн рейсы не считаем, чтобы избежать двойного подсчета'
      });
      
      return onlineCount;
    } catch (error) {
      console.error('Ошибка получения количества рейсов:', error);
      return shipmentCount; // Возвращаем текущее значение в случае ошибки
    }
  };

  // Проверяем количество оффлайн рейсов
  useEffect(() => {
    const checkOfflineCount = async () => {
      const count = await offlineSyncService.getOfflineCount();
      setOfflineCount(count);
    };
    checkOfflineCount();
  }, []);

  useEffect(() => {
    if (isOnline === true && offlineCount > 0) {
      offlineSyncService.syncOfflineShipments();
      setOfflineCount(0);
    }
  }, [isOnline, offlineCount]);

  useEffect(() => {
    if (isFocused && !isLoading) {
      loadVehicleBrands();
      loadContracts();
      loadShipments();
    }
  }, [isFocused, isLoading]);

  useEffect(() => {
    if (isFocused) {
      form.resetFields();
      setQrData('');
      setShowQRSheet(false);
      loadVehicleBrands();
      loadContracts();
      loadShipments();

      // Обновляем количество оффлайн рейсов
      const checkOfflineCount = async () => {
        const count = await offlineSyncService.getOfflineCount();
        setOfflineCount(count);
      };
      checkOfflineCount();
    }
  }, [isFocused]);

  useEffect(() => {
    if (contracts.length > 0 && !selectedContract) {
      const firstContract = contracts[0];
      setSelectedContract(firstContract.id.toString());
      setSelectedContractNumber(firstContract.number);
    }
  }, [contracts, selectedContract]);

  const prepareConfirmationData = async () => {
    try {
      const values = await form.validateFields();

      const formatTimeFromMinutes = (minutes: number | string) => {
        const mins = Number(minutes);
        if (isNaN(mins)) return 'Не выбрано';

        const hours = Math.floor(mins / 60);
        const remainingMinutes = mins % 60;

        if (hours > 0) {
          return `${hours}ч ${remainingMinutes}мин`;
        } else {
          return `${remainingMinutes}мин`;
        }
      };

      const selectedTimeLabel =
        timePicker.find(time => time.value.toString() === values?.arrival)
          ?.label || 'Не выбрано';

      const selectedContractLabel = selectedContractNumber || 'Не выбрано';

      const data = {
        driverName: values?.driverName || '',
        vehicleBrand: selectedVehicleBrandName || 'Не выбрано',
        vehicleNumber: values?.vehicle_number || '',
        contract: selectedContractLabel,
        arrivalTime: selectedTimeLabel,
        prefix: user?.prefix,
        shipmentCount: shipmentCount + 1, // Используем текущее количество + 1
      };

      setConfirmationData(data);
      setShowConfirmationModal(true);
    } catch (validationError) {
      console.error('Form validation error:', validationError);
      showValidationError('requiredField');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);
      // const id = uuid.v4().toString();

      const payload: ShipmentRequest = {
        counterparty_bin: user?.counterparty?.bin || '',
        contract_id: selectedContract || '',
        driver_info: values?.driverName || '',
        vehicle_brand_id:
          selectedVehicleBrand === 'custom' ? null : selectedVehicleBrand,
        vehicle_brand: selectedVehicleBrandName,
        vehicle_number: values?.vehicle_number || '',
        departure_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        estimated_arrival_time: Number(values?.arrival),
        user_id: user?.id.toString() || '',
        prefix:
          confirmationData?.prefix + '-' + confirmationData?.shipmentCount ||
          '',
      };

      // Дополнительная валидация перед отправкой
      if (!payload.counterparty_bin) {
        showValidationError('requiredField');
        return;
      }

      if (!selectedContract) {
        showValidationError('requiredField');
        return;
      }

      if (!payload.driver_info || payload.driver_info.length < 2) {
        showValidationError('requiredField');
        return;
      }

      if (!selectedVehicleBrand && !selectedVehicleBrandName) {
        showValidationError('requiredField');
        return;
      }

      if (!payload.vehicle_number || payload.vehicle_number.length < 2) {
        showValidationError('requiredField');
        return;
      }

      if (payload.vehicle_number.length > 20) {
        showValidationError('requiredField');
        return;
      }

      if (!payload.departure_time) {
        showValidationError('requiredField');
        return;
      }

      if (!payload.estimated_arrival_time) {
        showValidationError('requiredField');
        return;
      }

      try {
        // Получаем актуальное количество рейсов только один раз
        const actualCount = await getActualShipmentCount();
        const nextShipmentNumber = actualCount + 1;
        
        console.log('🔢 Количество рейсов для расчета номера:', {
          actualCount,
          nextShipmentNumber,
          isOnline,
          note: 'Считаем только онлайн рейсы, офлайн рейсы не учитываем'
        });
        
        const qrRequest = {
          counterparty: user?.counterparty?.name || '',
          counterparty_bin: user?.counterparty?.bin || '',
          vehicle_number: values?.vehicle_number || '',
          vehicle_brand: selectedVehicleBrandName,
          driver_info: values?.driverName || '',
          contract_number: selectedContractNumber,
          user_id: user?.id.toString() || '',
          prefix: user?.prefix + '-' + nextShipmentNumber,
        };

        setQrData(JSON.stringify(qrRequest));
        setShowQRSheet(true);

        if (isOnline === true) {
          const createdShipment = await shipmentsApi.createShipment(payload);
          try {
            await addShipmentToCache(createdShipment);
          } catch (cacheError) {
            console.error('Ошибка добавления в кэш:', cacheError);
          }
          showShipmentCreated();
        } else {
          // Для офлайн рейсов используем номер, который уже рассчитали
          await addOfflineShipment(payload);
          try {
            await addOfflineShipmentToCache(payload, user);
          } catch (cacheError) {
            console.error('Ошибка добавления в кэш:', cacheError);
          } finally {
            loadShipments();
          }
          setOfflineCount(prev => prev + 1);
          showBilingualToast('offlineDataAvailable', 'info');
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
          } finally {
            loadShipments();
          }
          setOfflineCount(prev => prev + 1);
          showBilingualToast('offlineDataAvailable', 'info');
          form.resetFields();
        }
      } finally {
        loadShipments();
      }
    } catch (validationError) {
      console.error('Form validation error:', validationError);
      showValidationError('requiredField');
    } finally {
      setLoading(false);
      loadShipments();
    }
  };

  const handleConfirm = () => {
    Alert.alert(
      'Подтверждение данных',
      'Вы уверены, что хотите создать рейс?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Подтвердить',
          onPress: () => {
            setShowConfirmationModal(false);
            handleSave();
          },
        },
      ],
    );
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
    setConfirmationData(null);
  };

  const handleReset = () => {
    form.resetFields();
    setQrData('');
    setShowQRSheet(false);
    setShowConfirmationModal(false);
    setConfirmationData(null);
    setSelectedVehicleBrand('');
    setSelectedVehicleBrandName('');
    setSelectedContract('');
    setSelectedContractNumber('');
    setSelectedArrivalTime('');
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
                <Input
                  placeholder="Введите имя водителя"
                  placeholderTextColor={COLORS.placeholder}
                  style={styles.input}
                />
              </Form.Item>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Марка автомобиля *</Text>
              <Form.Item
                name="vehicle"
                rules={[
                  {
                    required: selectedVehicleBrand ? false : true,
                    message: 'Выберите или введите марку автомобиля',
                  },
                ]}
              >
                <VehicleBrandSelector
                  vehicleBrands={vehicleBrands}
                  loading={vehicleBrandsLoading || isLoading}
                  selectedBrandId={selectedVehicleBrand}
                  selectedBrandName={selectedVehicleBrandName}
                  onBrandSelect={(id, name) => {
                    setSelectedVehicleBrand(id);
                    setSelectedVehicleBrandName(name);
                  }}
                  isOnline={isOnline || false}
                />
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
                <Input
                  placeholder="Введите номер автомобиля"
                  placeholderTextColor={COLORS.placeholder}
                  style={styles.input}
                />
              </Form.Item>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Контракт *</Text>
              <Form.Item
                name="contract"
                rules={[
                  {
                    required: selectedContract ? false : true,
                    message: 'Выберите контракт',
                  },
                ]}
              >
                {contractsLoading || isLoading ? (
                  <View style={styles.fieldLoadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : contracts.length > 0 ? (
                  <View style={styles.pickerContainer}>
                    <Picker
                      data={contracts.map(contract => ({
                        label: contract.number,
                        value: contract.id.toString(),
                      }))}
                      cols={1}
                      value={[selectedContract]}
                      onChange={values => {
                        const contractId = String(values[0]);
                        setSelectedContract(contractId);
                        const contract = contracts.find(
                          c => c.id.toString() === contractId,
                        );
                        setSelectedContractNumber(contract?.number || '');
                      }}
                      styles={{
                        container: {
                          borderBottomWidth: 0,
                          borderBottomColor: 'transparent',
                        },
                      }}
                    >
                      <List.Item
                        // arrow="horizontal"
                        styles={{ Item: styles.listItem }}
                      />
                    </Picker>
                    {!selectedContract ? (
                      <Text style={styles.placeholderText}>
                        Выберите контракт
                      </Text>
                    ) : null}
                  </View>
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
              <Text style={styles.fieldLabel}>Срок доставки *</Text>
              <Form.Item
                name="arrival"
                rules={[
                  {
                    required: true,
                    message: 'Выберите срок доставки',
                  },
                ]}
              >
                <View style={styles.pickerContainer}>
                  <Picker
                    data={timePicker}
                    onChange={values => {
                      const newValue = String(values[0]);
                      setSelectedArrivalTime(newValue);
                      form.setFieldsValue({ arrival: newValue });
                    }}
                    styles={{
                      container: {
                        borderBottomWidth: 0,
                        borderBottomColor: 'transparent',
                      },
                    }}
                  >
                    <List.Item
                      // arrow="horizontal"
                      styles={{ Item: styles.listItem }}
                      multipleLine
                    />
                  </Picker>
                  {!form.getFieldValue('arrival') ? (
                    <Text style={styles.placeholderText}>
                      Выберите срок доставки
                    </Text>
                  ) : null}
                </View>
              </Form.Item>
            </View>
          </List>
        </Form>

        <WhiteSpace size="lg" />

        <View style={styles.buttonWrapper}>
          <Button
            type="primary"
            onPress={prepareConfirmationData}
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
        prefix={
          confirmationData?.prefix + '-' + confirmationData?.shipmentCount || ''
        }
      />

      {confirmationData && (
        <ShipmentConfirmationModal
          isVisible={showConfirmationModal}
          onClose={handleCancelConfirmation}
          onConfirm={handleConfirm}
          data={confirmationData}
          vehicleBrands={vehicleBrands.map(brand => ({
            label: brand.name,
            value: brand.id.toString(),
          }))}
        />
      )}
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
    paddingBottom: 8,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  input: {
    marginBottom: 0,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#f3f3f3',
    padding: 8,
    borderRadius: 8,
    paddingLeft: 16,
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
    paddingTop: 8,
  },
  listItem: {
    paddingVertical: 0,
    textAlign: 'left',
    width: '100%',
    borderBottomColor: 'transparent',
    color: 'red',
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    paddingLeft: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  pickerContainer: {
    position: 'relative',
  },
  placeholderText: {
    position: 'absolute',
    top: 12,
    left: 16,
    fontSize: 16,
    color: COLORS.placeholder,
    zIndex: 1,
    pointerEvents: 'none',
  },
});

export default CreateShipmentScreen;
