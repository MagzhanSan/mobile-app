import { httpClient } from './http-client';
import { LoginResponse, User } from '../types/types';
import axios from 'axios';
import { getApiUrl } from '../config/api-config';
import { Alert } from 'react-native';

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
      `${getApiUrl()}/auth/login`,
      {
        ...credentials,
        platform: 'mobile',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await httpClient.get<{
      status: boolean;
      data: User;
      message: string;
    }>('/auth/user');
    return response.data;
  },

  logout: async (): Promise<void> => {
    return httpClient.post<void>('/auth/logout');
  },
};
