import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Button, List, Badge } from '@ant-design/react-native';
import { Text } from './CustomText';
import { COLORS } from '../consts/colors';
import moment from 'moment';

interface ShipmentConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vehicleBrands: {
    label: string;
    value: string;
  }[];
  data: {
    driverName: string;
    vehicleBrand: string;
    vehicleNumber: string;
    contract: string;
    arrivalTime: string;
    counterpartyName?: string;
    counterpartyBin?: string;
    userInfo?: string;
  };
}

const ShipmentConfirmationModal: React.FC<ShipmentConfirmationModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  data,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Подтверждение данных</Text>
            <Text style={styles.subtitle}>
              Проверьте введенные данные перед созданием рейса
            </Text>
          </View>

          <ScrollView>
            <List style={styles.list}>
              <List.Item>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Водитель:</Text>
                  <Text style={styles.fieldValue}>{data.driverName}</Text>
                </View>
              </List.Item>

              <List.Item>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Марка автомобиля:</Text>
                  <Text style={styles.fieldValue}>
                    {data?.vehicleBrand || 'Не выбрано'}
                  </Text>
                </View>
              </List.Item>

              <List.Item>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Номер автомобиля:</Text>
                  <Text style={styles.fieldValue}>{data.vehicleNumber}</Text>
                </View>
              </List.Item>

              <List.Item>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Контракт:</Text>
                  <Text style={styles.fieldValue}>{data.contract}</Text>
                </View>
              </List.Item>

              <List.Item>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Срок доставки:</Text>
                  <Text style={styles.fieldValue}>{data.arrivalTime}</Text>
                </View>
              </List.Item>
            </List>
          </ScrollView>

          <View style={styles.footer}>
            <Button type="ghost" onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </Button>

            <Button
              type="primary"
              onPress={onConfirm}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmButtonText}>Создать рейс</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 0,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  list: {
    backgroundColor: 'transparent',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    flex: 1,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#d9d9d9',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ShipmentConfirmationModal;
