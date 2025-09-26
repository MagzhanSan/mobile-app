import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Text } from './CustomText';
import { Icon, Input } from '@ant-design/react-native';
import { COLORS } from '../consts/colors';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/auth-context';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

interface QRCodeBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  qrData?: string;
  prefix?: string;
}

const QRCodeBottomSheet: React.FC<QRCodeBottomSheetProps> = ({
  isVisible,
  onClose,
  qrData,
  prefix,
}) => {
  const { user } = useAuth();
  const viewShotRef = useRef<ViewShot>(null);

  // Парсим данные из QR кода
  const parseQRData = () => {
    if (!qrData) return null;
    try {
      return JSON.parse(qrData);
    } catch (error) {
      console.error('Ошибка парсинга QR данных:', error);
      return null;
    }
  };

  const qrDataParsed = parseQRData();

  const handleShareQR = async () => {
    try {
      if (!viewShotRef.current || !viewShotRef.current.capture) {
        Alert.alert('Ошибка', 'Не удалось создать изображение QR-кода');
        return;
      }

      const uri = await viewShotRef.current.capture();

      let message = `QR-код для ${user?.counterparty?.name || 'организации'}\n`;
      message += `БИН: ${user?.counterparty?.bin || 'Не указан'}\n`;

      if (qrDataParsed) {
        message += `Номер ТС: ${qrDataParsed.vehicle_number || 'Не указан'}\n`;
        message += `Марка ТС: ${qrDataParsed.vehicle_brand || 'Не указана'}\n`;
        message += `Серия ТТН: ${prefix || 'Не указан'}\n`;
        message += `Данные водителя: ${
          qrDataParsed.driver_info || 'Не указаны'
        }\n`;
        message += `Номер контракта: ${
          qrDataParsed.contract_number || 'Не указан'
        }`;
      }

      const shareOptions = {
        title: 'QR-код рейса',
        message,
        url: `file://${uri}`,
        type: 'image/png',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Ошибка при совместном использовании:', error);
      Alert.alert('Ошибка', 'Не удалось поделиться QR-кодом');
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* <View>
            <Text style={styles.title}>{user?.counterparty?.name}</Text>
            <Text style={styles.subtitle}>{user?.counterparty?.bin}</Text>
          </View> */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.qrContainer}>
            <ViewShot
              ref={viewShotRef}
              options={{ format: 'png', quality: 0.9 }}
            >
              <View style={styles.qrPlaceholder}>
                <View style={styles.headerInfo}>
                  <Text style={styles.title}>{user?.counterparty?.name}</Text>
                  <Text style={styles.subtitle}>{user?.counterparty?.bin}</Text>
                </View>

                {qrDataParsed && (
                  <View style={styles.shipmentInfo}>
                    <Text style={styles.infoLabel}>Серия ТТН: {prefix}</Text>

                    <Text style={styles.infoLabel}>
                      Номер ТС: {qrDataParsed.vehicle_number || 'Не указан'}
                    </Text>
                    <Text style={styles.infoLabel}>
                      Марка ТС: {qrDataParsed.vehicle_brand || 'Не указана'}
                    </Text>
                    <Text style={styles.infoLabel}>
                      Данные водителя:{' '}
                      {qrDataParsed.driver_info || 'Не указаны'}
                    </Text>
                    <Text style={styles.infoLabel}>
                      Номер контракта:{' '}
                      {qrDataParsed.contract_number || 'Не указан'}
                    </Text>
                  </View>
                )}

                <QRCode value={qrData} size={200} />
              </View>
            </ViewShot>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareQR}
            >
              <Icon name="share-alt" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>Поделиться</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <Text style={styles.actionButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 9999, // Для Android
  },
  container: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '93%',
    zIndex: 10000,
    elevation: 10000, // Для Android
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  scrollContainer: {
    flex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
    width: '90%',
    borderRadius: 12,
    marginBottom: 20,
  },
  headerInfo: {
    marginBottom: 15,
    alignItems: 'center',
  },
  shipmentInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontWeight: '500',
  },
  qrText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  dataContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  dataText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRCodeBottomSheet;
