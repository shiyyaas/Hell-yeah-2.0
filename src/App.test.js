import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContent } from './App';
import * as authContextModule from './context/AuthContext';
import * as chatRoomsHook from './hooks/useChatRooms';
import * as chatMessagesHook from './hooks/useChatMessages';

describe('App Component', () => {
  it('renders login screen when unauthenticated', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<AppContent />);
    expect(screen.getByText('HELL YEAH 2.0.')).toBeInTheDocument();
    expect(screen.getByTestId('google-login-btn')).toBeInTheDocument();
  });

  it('renders dashboard when authenticated', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        uid: 'user-1',
        displayName: 'Steve Jobs',
      },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    vi.spyOn(chatRoomsHook, 'useChatRooms').mockReturnValue({
      rooms: [{ id: 'general', name: 'general' }],
      loading: false,
      createRoom: vi.fn(),
    });

    vi.spyOn(chatMessagesHook, 'useChatMessages').mockReturnValue({
      messages: [],
      loading: false,
      sendMessage: vi.fn(),
    });

    render(<AppContent />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('chat-room')).toBeInTheDocument();
  });
});
