import { httpClient } from './http-client';
import { Contract } from '../types/types';

export const getContracts = async (): Promise<Contract[]> => {
  return httpClient.get<Contract[]>('/contracts');
};
