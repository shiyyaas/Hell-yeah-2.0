import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatRoom } from './ChatRoom';
import { AuthContext } from '../context/AuthContext';
import * as chatMessagesHook from '../hooks/useChatMessages';

const mockUser = {
  uid: 'user-me',
  displayName: 'Current User',
  photoURL: 'https://example.com/me.jpg',
};

const mockMessages = [
  {
    id: 'msg-1',
    uid: 'user-other',
    displayName: 'Jony Ive',
    text: 'Form follows function.',
    createdAt: new Date('2025-01-01T12:00:00Z'),
  },
  {
    id: 'msg-2',
    uid: 'user-me',
    displayName: 'Current User',
    text: 'Hell yeah, absolutely!',
    createdAt: new Date('2025-01-01T12:01:00Z'),
  },
];

describe('ChatRoom Component', () => {
  it('renders room header and messages with dynamic bubble alignment', () => {
    vi.spyOn(chatMessagesHook, 'useChatMessages').mockReturnValue({
      messages: mockMessages,
      loading: false,
      error: null,
      sendMessage: vi.fn(),
    });

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <ChatRoom roomId="general" roomName="general" />
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('active-room-heading')).toHaveTextContent('general');
    expect(screen.getByText('Form follows function.')).toBeInTheDocument();
    expect(screen.getByText('Hell yeah, absolutely!')).toBeInTheDocument();

    const items = screen.getAllByTestId('message-item');
    expect(items[0]).toHaveClass('row-incoming');
    expect(items[1]).toHaveClass('row-outgoing');
  });

  it('sends a message when typed and submitted', async () => {
    const user = userEvent.setup();
    const sendMessageMock = vi.fn().mockResolvedValue({});
    vi.spyOn(chatMessagesHook, 'useChatMessages').mockReturnValue({
      messages: [],
      loading: false,
      error: null,
      sendMessage: sendMessageMock,
    });

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <ChatRoom roomId="general" roomName="general" />
      </AuthContext.Provider>
    );

    const input = screen.getByPlaceholderText('Message #general...');
    await user.type(input, 'Testing Firestore modular stream');

    const sendBtn = screen.getByLabelText('Send Message');
    await user.click(sendBtn);

    expect(sendMessageMock).toHaveBeenCalledWith('Testing Firestore modular stream', mockUser);
    expect(input.value).toBe('');
  });
});
