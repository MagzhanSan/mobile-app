import { Modal, View } from 'react-native';
import { Text } from './CustomText';

interface ModalConfirmProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ModalConfirm = ({ visible, onClose, onConfirm }: ModalConfirmProps) => {
  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View>
        <Text>Confirm</Text>  
      </View>
    </Modal>
  );
};