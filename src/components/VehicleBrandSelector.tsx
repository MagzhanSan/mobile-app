import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  List,
  Picker,
  Input,
  ActivityIndicator,
  Icon,
} from '@ant-design/react-native';
import { Text } from './CustomText';
import { COLORS } from '../consts/colors';

interface VehicleBrand {
  id: number;
  name: string;
}

interface VehicleBrandSelectorProps {
  vehicleBrands: VehicleBrand[];
  loading: boolean;
  selectedBrandId: string;
  selectedBrandName: string;
  onBrandSelect: (id: string, name: string) => void;
  isOnline: boolean;
}

const VehicleBrandSelector: React.FC<VehicleBrandSelectorProps> = ({
  vehicleBrands,
  loading,
  selectedBrandId,
  selectedBrandName,
  onBrandSelect,
  isOnline,
}) => {
  const [isPickerMode, setIsPickerMode] = useState(true);
  const [customBrandName, setCustomBrandName] = useState('');

  useEffect(() => {
    // Если выбрана марка из списка (не custom), переключаемся в режим picker
    if (selectedBrandId && selectedBrandName && selectedBrandId !== 'custom') {
      setIsPickerMode(true);
      setCustomBrandName('');
    }
  }, [selectedBrandId, selectedBrandName]);

  useEffect(() => {
    // Синхронизируем поле ввода с внешним состоянием
    if (selectedBrandId === 'custom' && selectedBrandName) {
      setCustomBrandName(selectedBrandName);
    }
  }, [selectedBrandId, selectedBrandName]);

  const handleModeToggle = () => {
    if (isPickerMode) {
      // Переключаемся в режим ручного ввода
      setIsPickerMode(false);
      setCustomBrandName('');
      onBrandSelect('', '');
    } else {
      // Переключаемся в режим выбора из списка
      setIsPickerMode(true);
      setCustomBrandName('');
      onBrandSelect('', '');
    }
  };

  const handleCustomBrandChange = (value: string) => {
    setCustomBrandName(value);
    if (value.trim().length > 0) {
      onBrandSelect('custom', value.trim());
    } else {
      onBrandSelect('', '');
    }
  };

  const handlePickerChange = (values: any[]) => {
    const brandId = String(values[0]);
    const brand = vehicleBrands.find(b => b.id.toString() === brandId);
    onBrandSelect(brandId, brand?.name || '');
  };

  return (
    <View style={styles.container}>
      {/* Переключатель режимов */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, isPickerMode && styles.modeButtonActive]}
          onPress={() => setIsPickerMode(true)}
        >
          <Icon
            name="down"
            size={16}
            color={isPickerMode ? '#fff' : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.modeButtonText,
              isPickerMode && styles.modeButtonTextActive,
            ]}
          >
            Из списка
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, !isPickerMode && styles.modeButtonActive]}
          onPress={() => setIsPickerMode(false)}
        >
          <Icon
            name="edit"
            size={16}
            color={!isPickerMode ? '#fff' : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.modeButtonText,
              !isPickerMode && styles.modeButtonTextActive,
            ]}
          >
            Ввести вручную
          </Text>
        </TouchableOpacity>
      </View>

      {/* Контент в зависимости от режима */}
      {isPickerMode ? (
        // Режим выбора из списка
        loading ? (
          <View style={styles.fieldLoadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : vehicleBrands.length > 0 ? (
          <View style={styles.pickerContainer}>
            <Picker
              data={vehicleBrands.map(brand => ({
                label: brand.name,
                value: brand.id.toString(),
              }))}
              cols={1}
              value={[selectedBrandId]}
              onChange={handlePickerChange}
              styles={{
                container: {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <List.Item
                align="middle"
                underlayColor="transparent"
                styles={{ Item: styles.listItem }}
              />
            </Picker>
            {!selectedBrandId || selectedBrandId === '' ? (
              <Text style={styles.placeholderText}>
                Выберите марку автомобиля
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {!isOnline ? 'Нет данных (оффлайн режим)' : 'Нет данных'}
            </Text>
          </View>
        )
      ) : (
        // Режим ручного ввода
        <View style={styles.inputContainer}>
          <Input
            placeholder="Введите марку автомобиля"
            placeholderTextColor={COLORS.placeholder}
            style={styles.input}
            value={customBrandName}
            onChangeText={handleCustomBrandChange}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  pickerContainer: {
    position: 'relative',
  },
  inputContainer: {
    width: '100%',
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
  listItem: {
    paddingVertical: 0,
    textAlign: 'left',
    width: '100%',
    borderBottomColor: 'transparent',
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    paddingLeft: 16,
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

export default VehicleBrandSelector;
