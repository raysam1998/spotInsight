// client/src/services/authService.ts

import axios from 'axios';

export interface User {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  country: string;
  product: string;
}

class AuthService {
  private api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
  });

  async getAuthUrl(): Promise<string> {
    try {
      const response = await this.api.get('/api/auth/spotify/url');
      return response.data.url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.api.get('/api/spotify/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.get('/api/auth/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  async handleCallback(code: string): Promise<boolean> {
    try {
      await this.api.post('/api/auth/callback', { code });
      return true;
    } catch (error) {
      console.error('Failed to handle callback:', error);
      return false;
    }
  }
}

export default new AuthService();