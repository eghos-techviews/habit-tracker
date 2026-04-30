import { STORAGE_KEYS } from './constants';
import type { User, Session } from '@/types/auth';
import type { Habit } from '@/types/habit';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getUsers(): User[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!raw) return [];
  try { return JSON.parse(raw) as User[]; } catch { return []; }
}

export function saveUsers(users: User[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getSession(): Session | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw || raw === 'null') return null;
  try { return JSON.parse(raw) as Session; } catch { return null; }
}

export function saveSession(session: Session | null): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.SESSION, 'null');
}

export function getHabits(): Habit[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
  if (!raw) return [];
  try { return JSON.parse(raw) as Habit[]; } catch { return []; }
}

export function saveHabits(habits: Habit[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}