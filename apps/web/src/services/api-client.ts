const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'فشل الطلب من الخادم');
  }

  return response.json() as Promise<T>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  username: string;
}

const TOKEN_KEY = 'shamchess:web:token';
const REFRESH_KEY = 'shamchess:web:refresh';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await request<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  localStorage.setItem(TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_KEY, data.refresh);
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const data = await request<RegisterResponse>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
