import {
  getOfflineShipments,
  removeOfflineShipment,
  updateOfflineShipmentStatus,
} from '../utils/offline-storage';
import { shipmentsApi } from '../api/shipments-api';
import { clearCache } from '../utils/cache-utils';
import { Toast } from '@ant-design/react-native';

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private isSyncing = false;
  private onSyncCompleteCallbacks: (() => void)[] = [];

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  // Добавляем callback для обновления списка рейсов
  addSyncCompleteCallback(callback: () => void): void {
    this.onSyncCompleteCallbacks.push(callback);
  }

  // Удаляем callback
  removeSyncCompleteCallback(callback: () => void): void {
    const index = this.onSyncCompleteCallbacks.indexOf(callback);
    if (index > -1) {
      this.onSyncCompleteCallbacks.splice(index, 1);
    }
  }

  // Вызываем все callbacks
  private notifySyncComplete(): void {
    this.onSyncCompleteCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in sync complete callback:', error);
      }
    });
  }

  // Синхронизация всех оффлайн рейсов
  async syncOfflineShipments(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      const offlineShipments = await getOfflineShipments();

      // Синхронизируем pending и failed рейсы
      const shipmentsToSync = offlineShipments.filter(
        shipment =>
          shipment.status === 'pending' || shipment.status === 'failed',
      );

      if (shipmentsToSync.length === 0) {
        this.isSyncing = false;
        return;
      }

      for (const shipment of shipmentsToSync) {
        try {
          await updateOfflineShipmentStatus(shipment.id, 'syncing');
          await shipmentsApi.createShipment(shipment.data);
          await updateOfflineShipmentStatus(shipment.id, 'synced');
          console.log(`Successfully synced shipment: ${shipment.id}`);
        } catch (error: any) {
          console.error(`Failed to sync shipment ${shipment.id}:`, error);

          // Если статус 403 (Forbidden), удаляем рейс без повторных попыток
          if (error?.response?.status === 403) {
            console.log(
              `Removing shipment ${shipment.id} due to 403 Forbidden`,
            );
            await removeOfflineShipment(shipment.id);
          } else {
            // Для других ошибок помечаем как failed для повторной попытки
            await updateOfflineShipmentStatus(shipment.id, 'failed');
          }
        }
      }

      const syncedCount = shipmentsToSync.length;
      if (syncedCount > 0) {
        Toast.success(`Синхронизировано ${syncedCount} рейсов`);
        // Уведомляем о завершении синхронизации
        this.notifySyncComplete();
        await clearCache();
        // Очищаем оффлайн рейсы после успешной синхронизации
        await this.clearSyncedOfflineShipments();
      }
    } catch (error) {
      console.error('Error during offline sync:', error);
      // Toast.fail('Ошибка синхронизации');
    } finally {
      this.isSyncing = false;
    }
  }

  // Получение количества оффлайн рейсов
  async getOfflineCount(): Promise<number> {
    const offlineShipments = await getOfflineShipments();
    return offlineShipments.filter(
      shipment => shipment.status === 'pending' || shipment.status === 'failed',
    ).length;
  }

  // Очистка синхронизированных оффлайн рейсов
  private async clearSyncedOfflineShipments(): Promise<void> {
    try {
      const offlineShipments = await getOfflineShipments();
      const syncedShipments = offlineShipments.filter(
        shipment => shipment.status === 'synced',
      );

      // Удаляем все синхронизированные рейсы
      for (const shipment of syncedShipments) {
        await removeOfflineShipment(shipment.id);
      }

      console.log(
        `Очищено ${syncedShipments.length} синхронизированных оффлайн рейсов`,
      );
    } catch (error) {
      console.error('Ошибка очистки синхронизированных оффлайн рейсов:', error);
    }
  }
}

export const offlineSyncService = OfflineSyncService.getInstance();
