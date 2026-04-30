import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '@/components/auth/SignupForm';
import LoginForm from '@/components/auth/LoginForm';
import { getSession, saveUsers } from '@/lib/storage';
import type { User } from '@/types/auth';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  mockPush.mockClear();
});

describe('auth flow', () => {
  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe('test@example.com');
  });

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup();
    const existingUser: User = {
      id: 'existing-id',
      email: 'existing@example.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
    };
    saveUsers([existingUser]);

    render(<SignupForm />);
    await user.type(screen.getByTestId('auth-signup-email'), 'existing@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('User already exists'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup();
    const existingUser: User = {
      id: 'user-1',
      email: 'login@example.com',
      password: 'secret',
      createdAt: new Date().toISOString(),
    };
    saveUsers([existingUser]);

    render(<LoginForm />);
    await user.type(screen.getByTestId('auth-login-email'), 'login@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'secret');
    await user.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
    const session = getSession();
    expect(session?.userId).toBe('user-1');
    expect(session?.email).toBe('login@example.com');
  });

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'nobody@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrongpass');
    await user.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password'));
    expect(mockPush).not.toHaveBeenCalled();
  });
});