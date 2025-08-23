import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './CustomText';
import { Icon, Input } from '@ant-design/react-native';
import { COLORS } from '../consts/colors';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/auth-context';

interface QRCodeBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  qrData?: string;
}

const QRCodeBottomSheet: React.FC<QRCodeBottomSheetProps> = ({
  isVisible,
  onClose,
  qrData,
}) => {
  const { user } = useAuth();

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

        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <View
              style={{
                marginBottom: 10,
              }}
            >
              <Text style={styles.title}>{user?.counterparty?.name}</Text>
              <Text style={styles.subtitle}>{user?.counterparty?.bin}</Text>
            </View>
            <QRCode value={qrData} size={200} />
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={onClose}>
          <Text style={styles.actionButtonText}>Закрыть</Text>
        </TouchableOpacity>
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
    zIndex: 1000,
  },
  container: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
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
