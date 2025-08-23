import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { Icon } from '@ant-design/react-native';
import { COLORS } from '../consts/colors';
import { useAuth } from '../contexts/auth-context';
import { VisionCameraScanner } from '../components/VisionCameraScanner';
import ShipmentApprovalBottomSheet from '../components/ShipmentApprovalBottomSheet';
import { usePermissions, EPermissionTypes } from '../hooks/usePermissions';
import { RESULTS } from 'react-native-permissions';
import { goToSettings } from '../utils/helpers';
import { shipmentsApi } from '../api/shipments-api';
import { Counterparty } from '../types/types';
import { showPermissionError } from '../utils/notifications';

const CheckScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isApprovalSheetVisible, setIsApprovalSheetVisible] = useState(false);
  const [currentShipmentId, setCurrentShipmentId] = useState<
    string | undefined
  >();
  const [counterpartyData, setCounterpartyData] = useState<Counterparty>();

  const { askPermissions } = usePermissions(EPermissionTypes.CAMERA);

  const handleCloseApprovalSheet = () => {
    setIsApprovalSheetVisible(false);
    setScannedData(null);
    setCurrentShipmentId(undefined);
  };

  const takePermissions = async () => {
    askPermissions()
      .then(response => {
        if (
          response.type === RESULTS.LIMITED ||
          response.type === RESULTS.GRANTED
        ) {
          setIsScanning(true);
        }
      })
      .catch(error => {
        if ('isError' in error && error.isError) {
          showPermissionError();
        }
        if ('type' in error) {
          if (error.type === RESULTS.UNAVAILABLE) {
            showPermissionError();
          } else if (
            error.type === RESULTS.BLOCKED ||
            error.type === RESULTS.DENIED
          ) {
            showPermissionError();
          }
        }
      });
  };

  const handleReadCode = (value: string) => {
    setScannedData(value);
    setIsScanning(false);

    let shipmentId: string | undefined;
    try {
      const parsedData = JSON.parse(value);
      shipmentId =
        parsedData.id || parsedData.shipment_id || parsedData.shipmentId;

      shipmentsApi
        .getCounterpartyData(parsedData?.counterparty_bin)
        .then(res => {
          setCounterpartyData(res);
        });
    } catch (error) {
      console.log('QR-код не содержит JSON данные');
    }

    setCurrentShipmentId(shipmentId);
    setIsApprovalSheetVisible(true);
  };

  useEffect(() => {
    const handleBackButtonClick = () => {
      if (isScanning) {
        setIsScanning(false);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );
    return () => {
      subscription?.remove();
    };
  }, [isScanning]);

  if (isScanning) {
    return (
      <VisionCameraScanner
        isVisible={isScanning}
        onClose={() => setIsScanning(false)}
        onReadCode={handleReadCode}
      />
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>QR-сканнер</Text>
            <Text style={styles.subtitle}>{user?.name || 'Пользователь'}</Text>
          </View>

          <View style={styles.qrCard}>
            <View style={styles.qrIconContainer}>
              <Icon name="qrcode" size={80} color={COLORS.primary} />
            </View>
            <Text style={styles.qrTitle}>Сканирование QR-кодов</Text>
            <Text style={styles.qrDescription}>
              {/* <Text>{JSON.stringify(counterpartyData)}</Text> */}
              Отсканируйте QR-код для получения информации о рейсе или товаре
            </Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={takePermissions}
            >
              <Icon
                name="camera"
                size={24}
                color="#fff"
                style={styles.scanIcon}
              />
              <Text style={styles.scanButtonText}>Начать сканирование</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Ваша роль</Text>
            <Text style={styles.roleText}>{user?.role?.label}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Доступные функции</Text>
            <Text style={styles.functionText}>
              • Сканирование QR-кодов{'\n'}• Обновление статусов{'\n'}• Ввод
              данных по вашей специализации
            </Text>
          </View>
        </View>
      </ScrollView>

      <ShipmentApprovalBottomSheet
        counterpartyData={counterpartyData}
        isVisible={isApprovalSheetVisible}
        onClose={handleCloseApprovalSheet}
        qrData={scannedData || ''}
        shipmentId={currentShipmentId}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  qrCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  qrIconContainer: {
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  qrDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanIcon: {
    marginRight: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  resultData: {
    fontSize: 14,
    color: COLORS.textSecondary,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  rescanButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  functionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default CheckScreen;
