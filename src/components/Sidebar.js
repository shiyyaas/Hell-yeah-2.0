import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Hash, Plus, LogOut, MessageSquare, Loader2, Sparkles } from 'lucide-react';

const SUGGESTED_ROOMS = [
  { id: 'general', name: 'general', description: 'Public discussion channel' },
  { id: 'random', name: 'random', description: 'Fun, off-topic, water cooler' },
  { id: 'engineering', name: 'engineering', description: 'Tech, architecture & code' },
  { id: 'design-systems', name: 'design-systems', description: 'Apple & Vercel design tokens' },
];

/**
 * Sidebar Component (The HELL YEAH 2.0 Navigation Panel)
 * - Fixed width (260px - 300px), full viewport height
 * - Clean structural borders following design.md
 * - Top Header: prominent minimalist brand typography "HELL YEAH 2.0"
 * - Section 1: "Suggested Rooms" prefixed with '#'
 * - Section 2: "My Rooms" dynamically mapped from useChatRooms
 * - Room Creation: inline input workflow / modal triggering firestore room write
 * - Bottom Profile Zone: Google avatar, display name, and minimalist "Log Out" action
 */
export const Sidebar = ({
  rooms = [],
  loading = false,
  activeRoomId,
  onSelectRoom,
  onCreateRoom,
}) => {
  const { user, logout } = useAuth();
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newRoomName.trim();
    if (!trimmed) return;

    try {
      setIsCreating(true);
      setErrorMessage('');
      const created = await onCreateRoom(trimmed);
      setNewRoomName('');
      setShowInput(false);
      if (created?.id) {
        onSelectRoom(created.id, created.name);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      setErrorMessage(err.message || 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className="sidebar-container" data-testid="sidebar">
      {/* Top Header: HELL YEAH 2.0 brand identity */}
      <div className="sidebar-header">
        <div className="brand-badge-row">
          <div className="brand-dot-pulse" />
          <span className="brand-version-mono">v2.0 PRO</span>
        </div>
        <h1 className="brand-title">HELL YEAH 2.0</h1>
        <p className="brand-subtitle">Real-time collaboration engine</p>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="sidebar-scrollable">
        {/* Section 1: Suggested Rooms */}
        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">SUGGESTED ROOMS</span>
            <Sparkles size={12} className="section-icon" />
          </div>
          <ul className="room-list">
            {SUGGESTED_ROOMS.map((item) => {
              const isActive = activeRoomId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`room-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectRoom(item.id, item.name)}
                    data-testid={`suggested-room-${item.id}`}
                  >
                    <Hash size={15} className="room-hash-icon" />
                    <span className="room-name">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Section 2: My Rooms (Firestore Real-time Stream) */}
        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">MY ROOMS</span>
            <button
              type="button"
              className="action-icon-btn"
              title="Create new room"
              aria-label="Create new room"
              onClick={() => {
                setShowInput((prev) => !prev);
                setErrorMessage('');
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Inline room creation form */}
          {showInput && (
            <form onSubmit={handleCreateSubmit} className="room-create-form" data-testid="create-room-form">
              <div className="input-wrap">
                <Hash size={14} className="input-prefix-icon" />
                <input
                  type="text"
                  className="room-name-input"
                  placeholder="room-name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  disabled={isCreating}
                  autoFocus
                  maxLength={32}
                />
              </div>
              <div className="create-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowInput(false);
                    setNewRoomName('');
                    setErrorMessage('');
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-create"
                  disabled={isCreating || !newRoomName.trim()}
                >
                  {isCreating ? <Loader2 size={13} className="spin" /> : 'Create'}
                </button>
              </div>
              {errorMessage && <p className="error-text">{errorMessage}</p>}
            </form>
          )}

          {/* Dynamic Rooms List */}
          {loading ? (
            <div className="rooms-loading-state">
              <Loader2 size={15} className="spin" />
              <span>Syncing rooms...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="rooms-empty-hint">
              <MessageSquare size={14} />
              <span>No custom rooms yet. Click + to create one.</span>
            </div>
          ) : (
            <ul className="room-list">
              {rooms.map((room) => {
                const isActive = activeRoomId === room.id;
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      className={`room-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => onSelectRoom(room.id, room.name)}
                      data-testid={`custom-room-${room.id}`}
                    >
                      <Hash size={15} className="room-hash-icon" />
                      <span className="room-name">{room.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom Profile Zone: Minimalist Apple/Vercel Layout */}
      <div className="sidebar-profile-zone">
        <div className="profile-info-group">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <div className="profile-text-wrap">
            <span className="profile-name">
              {user?.displayName || 'Active Member'}
            </span>
            <span className="profile-status-mono">ONLINE</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-icon-btn"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Log Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
