import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';
import { AuthContext } from '../context/AuthContext';

const mockUser = {
  uid: 'user-1',
  displayName: 'Craig Federighi',
  photoURL: 'https://example.com/craig.jpg',
};

const renderWithAuth = (ui, authValue = { user: mockUser, logout: vi.fn() }) => {
  return render(
    <AuthContext.Provider value={authValue}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('Sidebar Component', () => {
  it('renders brand identity and suggested channels', () => {
    renderWithAuth(
      <Sidebar
        rooms={[]}
        loading={false}
        activeRoomId="general"
        onSelectRoom={vi.fn()}
        onCreateRoom={vi.fn()}
      />
    );

    expect(screen.getByText('HELL YEAH 2.0')).toBeInTheDocument();
    expect(screen.getByText('SUGGESTED ROOMS')).toBeInTheDocument();
    expect(screen.getByTestId('suggested-room-general')).toBeInTheDocument();
    expect(screen.getByTestId('suggested-room-random')).toBeInTheDocument();
    expect(screen.getByText('Craig Federighi')).toBeInTheDocument();
  });

  it('selects a room on click', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    renderWithAuth(
      <Sidebar
        rooms={[{ id: 'room-abc', name: 'dev-chat' }]}
        loading={false}
        activeRoomId="general"
        onSelectRoom={handleSelect}
        onCreateRoom={vi.fn()}
      />
    );

    const customRoomBtn = screen.getByTestId('custom-room-room-abc');
    await user.click(customRoomBtn);

    expect(handleSelect).toHaveBeenCalledWith('room-abc', 'dev-chat');
  });

  it('creates a new room via inline form', async () => {
    const user = userEvent.setup();
    const handleCreate = vi.fn().mockResolvedValue({ id: 'new-id', name: 'react-team' });
    const handleSelect = vi.fn();

    renderWithAuth(
      <Sidebar
        rooms={[]}
        loading={false}
        activeRoomId="general"
        onSelectRoom={handleSelect}
        onCreateRoom={handleCreate}
      />
    );

    const addBtn = screen.getByLabelText('Create new room');
    await user.click(addBtn);

    const input = screen.getByPlaceholderText('room-name');
    await user.type(input, 'react-team');

    const submitBtn = screen.getByRole('button', { name: /^create$/i });
    await user.click(submitBtn);

    expect(handleCreate).toHaveBeenCalledWith('react-team');
    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledWith('new-id', 'react-team');
    });
  });
});
