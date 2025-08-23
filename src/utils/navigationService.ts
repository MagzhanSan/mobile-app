import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

export function resetToAuth() {
  if (navigationRef.isReady()) {
    // Используем navigate вместо reset, так как Auth находится в корневом стеке
    navigationRef.navigate('Auth' as never);
  }
}
