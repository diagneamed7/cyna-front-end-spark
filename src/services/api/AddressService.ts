import { apiClient } from './client';

export interface UserAddress {
  id: number;
  label: string;
  address: string;
  // Ajoutez d'autres champs selon le backend (ex: code_postal, ville, etc.)
}

export class AddressService {
  async getAddresses(): Promise<UserAddress[]> {
    return apiClient.get<UserAddress[]>(
      '/user/addresses',
      undefined,
      { cache: false }
    );
  }

  async addAddress(data: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    const response = await apiClient.post<{ success: boolean; data: UserAddress }>(
      '/user/addresses',
      data,
      { cache: false }
    );
    return response.data;
  }

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(
      `/user/addresses/${id}`,
      { cache: false }
    );
  }
}

export const addressService = new AddressService(); 