import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput } from './CustomText';
import { Checkbox, Icon, Toast } from '@ant-design/react-native';
import { COLORS } from '../consts/colors';
import { shipmentsApi } from '../api/shipments-api';
import { useAuth } from '../contexts/auth-context';
import { Counterparty } from '../types/types';
import {
  showBilingualAlert,
  showBilingualToast,
  showValidationError,
  showUpdateSuccess,
  showServerError,
} from '../utils/notifications';

interface ShipmentApprovalBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  qrData: string;
  shipmentId?: string;
  counterpartyData?: Counterparty;
}

const ShipmentApprovalBottomSheet: React.FC<
  ShipmentApprovalBottomSheetProps
> = ({ isVisible, onClose, qrData, shipmentId, counterpartyData }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [isConditioned, setIsConditioned] = useState(true);
  const [needLabTesting, setNeedLabTesting] = useState(true);
  const [generalContamination, setGeneralContamination] = useState('');
  const [sugarContent, setSugarContent] = useState('');
  const [pileNumber, setPileNumber] = useState('');
  const [boomNumber, setBoomNumber] = useState('');
  const [needPileNumber, setNeedPileNumber] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [data, setData] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Функция валидации процентов (от 0 до 100)
  const validatePercentage = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  // Функция для обработки изменения процентов с валидацией
  const handlePercentageChange = (
    value: string,
    setter: (value: string) => void,
  ) => {
    // Убираем все символы кроме цифр и точки
    const cleanValue = value.replace(/[^0-9.]/g, '');

    // Проверяем, что точка только одна
    const dotCount = (cleanValue.match(/\./g) || []).length;
    if (dotCount > 1) return;

    // Ограничиваем количество знаков после точки
    const parts = cleanValue.split('.');
    if (parts[1] && parts[1].length > 2) return;

    setter(cleanValue);

    // Показываем ошибку если значение не в диапазоне
    if (cleanValue && !validatePercentage(cleanValue)) {
      setErrorMessage('Значение должно быть от 0 до 100');
    } else {
      setErrorMessage('');
    }
  };

  // Функция для обработки изменения целых чисел с валидацией
  const handleIntegerChange = (
    value: string,
    setter: (value: string) => void,
  ) => {
    // Убираем все символы кроме цифр
    const cleanValue = value.replace(/[^0-9]/g, '');

    // Ограничиваем длину числа (максимум 9 цифр для безопасности)
    if (cleanValue.length > 9) return;

    // Проверяем, что число не превышает максимальное значение INT
    if (cleanValue && parseInt(cleanValue) > 2147483647) return;

    setter(cleanValue);
  };

  // Определяем роль пользователя
  const userRole = user?.role?.value;

  const handleAccept = async (
    status?: 'accepted' | 'declined' | 'left' | 'arrived',
  ) => {
    if (!shipmentId) {
      showBilingualAlert('error', 'unknownError');
      return;
    }

    // Валидация для лаборанта
    if (userRole === 'lab_assistant') {
      if (generalContamination && !validatePercentage(generalContamination)) {
        showValidationError('requiredField');
        return;
      }
      if (sugarContent && !validatePercentage(sugarContent)) {
        showValidationError('requiredField');
        return;
      }
    }

    // Валидация для оператора кагата
    if (userRole === 'pile_operator') {
      if (!needPileNumber && (!pileNumber || pileNumber.trim() === '')) {
        showValidationError('requiredField');
        return;
      }
      if (!needPileNumber && parseInt(pileNumber) <= 0) {
        showValidationError('requiredField');
        return;
      }
    }

    // Валидация для оператора бума
    if (userRole === 'boom_operator') {
      if (!boomNumber || boomNumber.trim() === '') {
        showValidationError('requiredField');
        return;
      }
      if (parseInt(boomNumber) <= 0) {
        showValidationError('requiredField');
        return;
      }
    }

    setIsLoading(true);
    try {
      let updateData: any = {};

      switch (userRole) {
        case 'receiver':
          updateData = {
            is_conditioned: isConditioned,
            need_lab_testing: needLabTesting,
            status,
            ...JSON.parse(qrData),
          };

          // Добавляем причину отклонения если статус declined
          if (status === 'declined' && rejectionReason.trim()) {
            updateData.details = rejectionReason.trim();
          }

          await shipmentsApi.createShipment(updateData);
          break;

        case 'lab_assistant':
          // PUT запрос для лаборанта
          updateData = {
            general_contamination: parseFloat(generalContamination) || 0,
            sugar_content: parseFloat(sugarContent) || 0,
          };
          await shipmentsApi.updateShipment(shipmentId, updateData);
          break;

        case 'pile_operator':
          // PUT запрос для оператора кагата
          updateData = {
            pile_number: !needPileNumber ? pileNumber : -1,
          };
          await shipmentsApi.updateShipment(shipmentId, updateData);
          break;

        case 'boom_operator':
          // PUT запрос для оператора Бума
          updateData = {
            boom_number: boomNumber,
          };
          await shipmentsApi.updateShipment(shipmentId, updateData);
          break;

        case 'security':
          updateData = {
            status,
            details: rejectionReason,
            ...JSON.parse(qrData),
          };
          await shipmentsApi.createShipment(updateData);
          break;

        default:
          showBilingualAlert('error', 'unknownError');
          return;
      }

      showUpdateSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      setData(error.response?.data || error.message);
      showServerError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    Keyboard.dismiss();
    setShowRejectionModal(true);
  };

  const handleRejectConfirm = () => {
    const isSecurity = userRole === 'security';

    if (!isSecurity && !rejectionReason.trim()) {
      showValidationError('requiredField');
      return;
    }

    if (isSecurity) {
      showBilingualAlert('confirm', 'save', [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Сохранить',
          style: 'default',
          onPress: () => {
            handleAccept('left');
            onClose();
            resetForm();
          },
        },
      ]);
    } else {
      handleAccept(isSecurity ? 'left' : 'declined');
      setShowRejectionModal(false);
      onClose();
      resetForm();
    }
  };

  const handleRejectCancel = () => {
    setShowRejectionModal(false);
    setRejectionReason('');
  };

  const handleAcceptHandler = () => {
    Keyboard.dismiss();
    const isReseiver = userRole === 'receiver';
    const isSecurity = userRole === 'security';

    showBilingualAlert('confirm', 'save', [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: isReseiver ? 'Принять' : 'Сохранить',
        style: 'default',
        onPress: () => {
          handleAccept(isSecurity ? 'arrived' : 'accepted');
          onClose();
          resetForm();
        },
      },
    ]);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setIsConditioned(false);
    setNeedLabTesting(false);
    setGeneralContamination('');
    setSugarContent('');
    setPileNumber('');
    setBoomNumber('');
    setRejectionReason('');
  };

  const getNumber = (data: string) => {
    try {
      const qrParsedData = JSON.parse(data);

      return qrParsedData?.vehicle_number || '';
    } catch (error) {
      // console.error('Ошибка парсинга JSON:', error);
      return '';
    }
  };

  // Рендерим форму в зависимости от роли
  const renderForm = () => {
    switch (userRole) {
      case 'receiver':
        return (
          <View style={styles.formSection}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIsConditioned(!isConditioned)}
              >
                <Icon
                  name={isConditioned ? 'check-square' : 'border'}
                  size={24}
                  color={isConditioned ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={styles.checkboxLabel}>Кондиционный</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setNeedLabTesting(!needLabTesting)}
              >
                <Icon
                  name={needLabTesting ? 'check-square' : 'border'}
                  size={24}
                  color={needLabTesting ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={styles.checkboxLabel}>
                  Требуется лабораторное тестирование
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'lab_assistant':
        return (
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Общая загрязненность (%)</Text>
              <TextInput
                style={styles.textInput}
                value={generalContamination}
                onChangeText={value =>
                  handlePercentageChange(value, setGeneralContamination)
                }
                placeholder="0-100%"
                keyboardType="numeric"
                returnKeyType="done"
                placeholderTextColor={COLORS.placeholder}
                onSubmitEditing={() => Keyboard.dismiss()}
                blurOnSubmit={true}
              />
              {errorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Содержание сахара (%)</Text>
              <TextInput
                style={styles.textInput}
                value={sugarContent}
                onChangeText={value =>
                  handlePercentageChange(value, setSugarContent)
                }
                placeholder="0-100%"
                keyboardType="numeric"
                returnKeyType="done"
                placeholderTextColor={COLORS.placeholder}
                onSubmitEditing={() => Keyboard.dismiss()}
                blurOnSubmit={true}
              />
              {errorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
            </View>
          </View>
        );

      case 'pile_operator':
        return (
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Номер кагата</Text>
              <View style={styles.checkboxContainer}>
                <View style={styles.checkboxStyle}>
                  <Text style={styles.checkboxLabel}>В бурячку</Text>
                  <View style={styles.checkboxWrapper}>
                    <Checkbox
                      checked={needPileNumber}
                      onChange={() => setNeedPileNumber(!needPileNumber)}
                    />
                  </View>
                </View>
              </View>

              <TextInput
                style={{
                  ...styles.textInput,
                  backgroundColor: needPileNumber ? '#f5f5f5' : '#fff',
                }}
                value={needPileNumber ? 'В бурячку' : pileNumber}
                onChangeText={value =>
                  handleIntegerChange(value, setPileNumber)
                }
                keyboardType="numeric"
                editable={!needPileNumber}
                placeholder="Введите номер кагата"
                returnKeyType="done"
                placeholderTextColor={COLORS.placeholder}
                onSubmitEditing={() => Keyboard.dismiss()}
                blurOnSubmit={true}
              />
            </View>
          </View>
        );

      case 'boom_operator':
        return (
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Номер Бума</Text>
              <TextInput
                style={styles.textInput}
                value={boomNumber}
                onChangeText={value =>
                  handleIntegerChange(value, setBoomNumber)
                }
                placeholder="Введите номер Бума"
                keyboardType="numeric"
                returnKeyType="done"
                placeholderTextColor={COLORS.placeholder}
                onSubmitEditing={() => Keyboard.dismiss()}
                blurOnSubmit={true}
              />
            </View>
          </View>
        );

      case 'security':
        return (
          <View style={styles.formSection}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Укажите причину"
              multiline={true}
              numberOfLines={4}
              placeholderTextColor={COLORS.placeholder}
              textAlignVertical="top"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              blurOnSubmit={true}
            />
          </View>
        );

      default:
        return (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              Неизвестная роль пользователя
            </Text>
          </View>
        );
    }
  };

  const getTitle = () => {
    switch (userRole) {
      case 'receiver':
        return 'Проверка качества';
      case 'lab_assistant':
        return 'Лабораторные данные';
      case 'pile_operator':
        return 'Данные кагата';
      case 'boom_operator':
        return 'Данные Бума';
      case 'security':
        return 'Данные охраны';
      default:
        return 'Одобрение рейса';
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.header}>
              <Text style={styles.title}>{getTitle()}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {counterpartyData && (
                <View style={styles.counterpartySection}>
                  <Text style={styles.counterpartyTitle}>Данные по рейсу</Text>
                  <View style={styles.counterpartyCard}>
                    <View style={styles.counterpartyRow}>
                      <Text style={styles.counterpartyLabel}>Название:</Text>
                      <Text style={styles.counterpartyValue}>
                        {counterpartyData.name}
                      </Text>
                    </View>
                    <View style={styles.counterpartyRow}>
                      <Text style={styles.counterpartyLabel}>БИН:</Text>
                      <Text style={styles.counterpartyValue}>
                        {counterpartyData.bin}
                      </Text>
                    </View>
                    <View style={styles.counterpartyRow}>
                      <Text style={styles.counterpartyLabel}>
                        Номер машины:
                      </Text>
                      <Text style={styles.counterpartyValue}>
                        {getNumber(qrData)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {renderForm()}
            </ScrollView>
            <View style={styles.actions}>
              {(userRole === 'receiver' || userRole === 'security') && (
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() =>
                    userRole === 'security'
                      ? handleRejectConfirm()
                      : handleReject()
                  }
                  disabled={isLoading}
                >
                  <Text style={styles.rejectButtonText}>
                    {userRole === 'security' ? 'Выехал' : 'Отклонить'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.acceptButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={() => handleAcceptHandler()}
                disabled={isLoading}
              >
                <Text style={styles.acceptButtonText}>
                  {isLoading
                    ? 'Обработка...'
                    : userRole === 'receiver'
                    ? 'Принять'
                    : userRole === 'security'
                    ? 'Прибыл'
                    : 'Сохранить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Модалка отклонения */}
      <Modal
        visible={showRejectionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleRejectCancel}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View style={styles.bottomSheet}>
              <View style={styles.header}>
                <Text style={styles.title}>Отклонить рейс</Text>
                <TouchableOpacity
                  onPress={handleRejectCancel}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formSection}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Причина отклонения *</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={rejectionReason}
                      onChangeText={setRejectionReason}
                      placeholder="Укажите причину отклонения рейса"
                      multiline={true}
                      numberOfLines={4}
                      placeholderTextColor={COLORS.placeholder}
                      textAlignVertical="top"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      blurOnSubmit={true}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleRejectCancel}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.rejectButton,
                    !rejectionReason.trim() && styles.disabledButton,
                  ]}
                  onPress={handleRejectConfirm}
                  disabled={isLoading || !rejectionReason.trim()}
                >
                  <Text style={styles.rejectButtonText}>
                    {isLoading ? 'Обработка...' : 'Отклонить'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  qrDataSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  qrDataText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  formSection: {
    marginBottom: 20,
  },
  checkboxContainer: {
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  rejectButton: {
    backgroundColor: '#ff4757',
  },
  disabledButton: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    display: 'flex',
  },
  checkboxWrapper: {
    transform: [{ scale: 1.25 }],
  },
  counterpartySection: {
    marginBottom: 20,
    borderRadius: 10,
  },
  counterpartyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  counterpartyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterpartyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  counterpartyLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  counterpartyValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  errorMessage: {
    color: '#ff4757',
    fontSize: 12,
    marginTop: 5,
  },
});

export default ShipmentApprovalBottomSheet;
