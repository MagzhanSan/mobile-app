import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Text } from './CustomText';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { Icon } from '@ant-design/react-native';
import { COLORS } from '../consts/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface IVisionCameraScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onReadCode: (value: string) => void;
}

export const VisionCameraScanner = ({
  isVisible,
  onClose,
  onReadCode,
}: IVisionCameraScannerProps) => {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [flash, setFlash] = useState<'on' | 'off'>('off');

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isCameraInitialized) {
      timeout = setTimeout(() => {
        setIsActive(true);
        setFlash('off');
      }, 0);
    }
    setIsActive(false);
    return () => {
      clearTimeout(timeout);
    };
  }, [isCameraInitialized]);

  const onInitialized = () => {
    setIsCameraInitialized(true);
  };

  const onError = (error: CameraRuntimeError) => {
    console.log('Camera error:', error);
    Alert.alert('Ошибка камеры', error.message);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        if (codes[0].value) {
          console.log('QR Code scanned:', codes[0].value);
          onReadCode(codes[0].value);
          onClose();
        }
      }
    },
  });

  const toggleFlash = () => {
    setFlash(flash === 'on' ? 'off' : 'on');
  };

  if (!device) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.errorContainer}>
          <Icon
            name="camera"
            size={80}
            color="#fff"
            style={{ marginBottom: 20 }}
          />
          <Text style={styles.errorTitle}>Камера недоступна</Text>
          <Text style={styles.errorText}>
            Не удалось инициализировать камеру. Убедитесь, что у приложения есть
            доступ к камере.
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={isActive && isVisible}
          codeScanner={codeScanner}
          onInitialized={onInitialized}
          onError={onError}
          photo={false}
          torch={flash}
        />

        {/* Overlay with scanning area */}
        <View style={styles.overlay}>
          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Сканирование QR-кода</Text>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <Icon
                name={flash === 'on' ? 'bulb' : 'bulb'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Scanning frame */}
          <View style={styles.scanningFrame}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          {/* Bottom instructions */}
          <View style={styles.bottomInstructions}>
            <Text style={styles.instructionsText}>
              Наведите камеру на QR-код в рамке
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    marginLeft: -(screenWidth * 0.7) / 2,
    marginTop: -(screenWidth * 0.7) / 2,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  bottomInstructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
