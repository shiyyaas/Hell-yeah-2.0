import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseModule from '../firebase';

vi.mock('../firebase', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    auth: { currentUser: null },
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
  };
});

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    onAuthStateChanged: vi.fn((auth, cb) => {
      cb({
        uid: 'user-123',
        displayName: 'Steve Jobs',
        email: 'steve@apple.com',
        photoURL: 'https://example.com/avatar.png',
      });
      return () => {};
    }),
  };
});

const ConsumerComponent = () => {
  const { user, loading, logout, login } = useAuth();
  if (loading) return <div>Loading Auth...</div>;
  return (
    <div>
      <span data-testid="user-name">{user ? user.displayName : 'Guest'}</span>
      <button onClick={logout}>Sign Out</button>
      <button onClick={login}>Sign In</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('provides authenticated user state without flickering', async () => {
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(await screen.findByTestId('user-name')).toHaveTextContent('Steve Jobs');
  });

  it('triggers login and logout callbacks', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    await user.click(signOutBtn);
    expect(firebaseModule.logout).toHaveBeenCalled();

    const signInBtn = screen.getByRole('button', { name: /sign in/i });
    await user.click(signInBtn);
    expect(firebaseModule.loginWithGoogle).toHaveBeenCalled();
  });
});
