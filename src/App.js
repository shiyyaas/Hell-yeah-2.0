import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { useChatRooms } from './hooks/useChatRooms';
import { Sidebar } from './components/Sidebar';
import { ChatRoom } from './components/ChatRoom';
import {
  MessageSquare,
  Sparkles,
  Zap,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import './index.css';

/**
 * Google SVG Logo
 */
const GoogleIcon = () => (
  <svg className="google-icon-svg" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

/**
 * Login Screen View
 */
const LoginScreen = () => {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSignIn = async () => {
    try {
      setSubmitting(true);
      setAuthError('');
      await login();
    } catch (err) {
      console.error('Sign in failed:', err);
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Mesh gradient atmospheric depth from DESIGN.md */}
      <div className="mesh-gradient-backdrop" />

      <div className="login-card">
        <div className="login-brand-eyebrow">
          <Sparkles size={13} />
          <span>Real-time Workspace</span>
        </div>

        <h1 className="login-hero-title">HELL YEAH 2.0.</h1>
        <p className="login-hero-description">
          The ultra-minimalist, real-time multi-room messaging client designed for high-performing engineering teams.
        </p>

        <div className="login-features-list">
          <div className="login-feature-item">
            <Zap size={16} />
            <span>Sub-millisecond Firestore snapshots</span>
          </div>
          <div className="login-feature-item">
            <Shield size={16} />
            <span>Zero-trust Apple & Vercel design language</span>
          </div>
        </div>

        <button
          type="button"
          className="google-auth-button"
          onClick={handleSignIn}
          disabled={submitting}
          data-testid="google-login-btn"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="spin" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {authError && (
          <div className="auth-error-banner" data-testid="auth-error">
            <AlertCircle size={14} />
            <span>{authError}</span>
          </div>
        )}

        <p className="login-footnote">
          Powered by Firebase v10 Modular SDK & React
        </p>
      </div>
    </div>
  );
};

/**
 * Main Authenticated Dashboard Layout
 */
const Dashboard = () => {
  const { user } = useAuth();
  const { rooms, loading: roomsLoading, createRoom } = useChatRooms();
  const [activeRoomId, setActiveRoomId] = useState('general');
  const [activeRoomName, setActiveRoomName] = useState('general');

  // Handle room selection
  const handleSelectRoom = (roomId, roomName) => {
    setActiveRoomId(roomId);
    setActiveRoomName(roomName || roomId);
  };

  // Handle new room creation from sidebar
  const handleCreateRoom = async (name) => {
    const newRoom = await createRoom(name, user);
    return newRoom;
  };

  return (
    <div className="app-viewport-root">
      <Sidebar
        rooms={rooms}
        loading={roomsLoading}
        activeRoomId={activeRoomId}
        onSelectRoom={handleSelectRoom}
        onCreateRoom={handleCreateRoom}
      />
      {activeRoomId ? (
        <ChatRoom roomId={activeRoomId} roomName={activeRoomName} />
      ) : (
        <main className="empty-canvas-container">
          <div className="empty-canvas-card">
            <MessageSquare size={36} className="text-mute" />
            <h3 className="empty-canvas-title">Select a room to begin</h3>
            <p className="empty-canvas-subtitle">
              Choose from suggested channels on the left or create your own custom chat room.
            </p>
          </div>
        </main>
      )}
    </div>
  );
};

/**
 * Centralized Entry Point with Auth Guard
 */
export const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen" data-testid="auth-loading">
        <Loader2 size={32} className="spin text-mute" />
        <span className="loading-brand-pill">AUTHENTICATING HELL YEAH 2.0</span>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginScreen />;
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
