import { request } from './api-client';

export interface Tournament {
  id: number;
  name: string;
  startDate: string;
  status: 'upcoming' | 'live' | 'completed';
  prizePool: number;
  entrants: number;
}

const fallbackTournaments: Tournament[] = [
  {
    id: 1,
    name: 'بطولة دمشق المفتوحة',
    startDate: new Date().toISOString(),
    status: 'live',
    prizePool: 1500,
    entrants: 128
  },
  {
    id: 2,
    name: 'كأس الشام السريع',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: 'upcoming',
    prizePool: 800,
    entrants: 64
  },
  {
    id: 3,
    name: 'بطولة الأساتذة المغلقة',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: 'completed',
    prizePool: 3000,
    entrants: 32
  }
];

export async function fetchTournaments(): Promise<Tournament[]> {
  try {
    return await request<Tournament[]>('/tournaments/');
  } catch (error) {
    console.warn('تعذر تحميل البطولات من الخادم، سيتم استخدام بيانات افتراضية.', error);
    return fallbackTournaments;
  }
}
