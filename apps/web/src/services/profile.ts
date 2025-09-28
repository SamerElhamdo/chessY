import { getStoredToken, request } from './api-client';

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  rating: number;
  country: string;
  biography?: string;
}

export async function fetchProfile(): Promise<ProfileResponse> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول للوصول إلى الملف الشخصي.');
  }

  return request<ProfileResponse>('/auth/me/', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
