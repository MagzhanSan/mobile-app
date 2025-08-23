import { useCallback } from 'react';
import { PERMISSIONS, RESULTS, request, check } from 'react-native-permissions';
import { Platform } from 'react-native';

export type TUsePermissionsReturnType = {
  isError?: boolean;
  type: (typeof RESULTS)[keyof typeof RESULTS];
  errorMessage?: string;
};

export enum EPermissionTypes {
  CAMERA = 'camera',
}

export const usePermissions = (typeOfPermission: EPermissionTypes) => {
  const getPermission = useCallback(() => {
    if (
      !typeOfPermission ||
      !Object.values(EPermissionTypes).includes(typeOfPermission)
    ) {
      throw new Error('Unsupported Type of permission.');
    }

    if (Platform.OS === 'ios') {
      switch (typeOfPermission) {
        case EPermissionTypes.CAMERA:
          return PERMISSIONS.IOS.CAMERA;
        default:
          return PERMISSIONS.IOS.CAMERA;
      }
    }

    if (Platform.OS === 'android') {
      switch (typeOfPermission) {
        case EPermissionTypes.CAMERA:
          return PERMISSIONS.ANDROID.CAMERA;
        default:
          return PERMISSIONS.ANDROID.CAMERA;
      }
    }

    throw new Error('Unsupported Operating System.');
  }, [typeOfPermission]);

  const askPermissions =
    useCallback(async (): Promise<TUsePermissionsReturnType> => {
      return new Promise<TUsePermissionsReturnType>(async (resolve, reject) => {
        try {
          // Сначала проверяем текущий статус
          const currentStatus = await check(getPermission());

          if (
            currentStatus === RESULTS.GRANTED ||
            currentStatus === RESULTS.LIMITED
          ) {
            return resolve({
              type: currentStatus,
            });
          }

          // Если разрешение не дано, запрашиваем его
          const result = await request(getPermission());

          switch (result) {
            case RESULTS.UNAVAILABLE:
              return reject({
                type: RESULTS.UNAVAILABLE,
              });
            case RESULTS.DENIED:
              return reject({
                type: RESULTS.DENIED,
              });
            case RESULTS.GRANTED:
              return resolve({
                type: RESULTS.GRANTED,
              });
            case RESULTS.BLOCKED:
              return reject({
                type: RESULTS.BLOCKED,
              });
            case RESULTS.LIMITED:
              return resolve({
                type: RESULTS.LIMITED,
              });
          }
        } catch (e: { data: { message: string | undefined } } | any) {
          return reject({
            isError: true,
            errorMessage:
              e?.data?.message ||
              e.message ||
              'Something went wrong while asking for permissions.',
          });
        }
      });
    }, [getPermission]);

  return {
    askPermissions,
  };
};
