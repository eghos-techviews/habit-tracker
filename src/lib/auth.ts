import { getUsers, saveUsers, saveSession, clearSession } from './storage';
import type { User, Session } from '@/types/auth';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function signUp(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return { success: false, error: 'User already exists' };

  const newUser: User = {
    id: generateId(),
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, newUser]);
  saveSession({ userId: newUser.id, email: newUser.email });
  return { success: true };
}

export function logIn(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { success: false, error: 'Invalid email or password' };
  saveSession({ userId: user.id, email: user.email });
  return { success: true };
}

export function logOut(): void {
  clearSession();
}