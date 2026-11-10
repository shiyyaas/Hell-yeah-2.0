import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChatMessages } from '../hooks/useChatMessages';
import {
  Send,
  Hash,
  Loader2,
  AlertCircle,
  Users,
  ShieldCheck,
  CornerDownLeft,
} from 'lucide-react';

/**
 * Format timestamps nicely (handles Firestore Timestamp objects or Date)
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return 'Just now';
  }
};

/**
 * ChatRoom Component (The Canvas & Input Engine)
 * - Flex-grow container taking up the remaining horizontal space
 * - Header Bar: selected Room Name with crisp baseline divider border
 * - Message Feed Canvas: scrollable area mapping messages
 * - Dynamic bubble styling: aligned right for current user; aligned left with avatar/name for others
 * - Auto-Scroll Effect: useEffect with DOM ref smoothly snapping down on new messages
 * - Input Bar Area: positioned firmly at bottom, sleek text field with isolated send icon
 */
export const ChatRoom = ({ roomId, roomName }) => {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useChatMessages(roomId);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll effect: smoothly snap down to the newest message whenever messages array updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when roomId changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [roomId]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    try {
      setIsSending(true);
      setSendError('');
      await sendMessage(text, user);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setSendError(err.message || 'Failed to deliver message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="chat-canvas-container" data-testid="chat-room">
      {/* Header Bar */}
      <header className="chat-header-bar">
        <div className="header-left-col">
          <div className="channel-hash-badge">
            <Hash size={18} />
          </div>
          <div className="header-title-meta">
            <div className="room-title-row">
              <h2 className="active-room-heading" data-testid="active-room-heading">
                {roomName || 'Select a Channel'}
              </h2>
              <span className="room-id-badge">#{roomId}</span>
            </div>
            <p className="room-subtitle-meta">
              Stream-synced Firestore sub-collection: /rooms/{roomId}/messages
            </p>
          </div>
        </div>

        <div className="header-right-col">
          <div className="network-status-indicator">
            <span className="status-ping-dot" />
            <span className="status-label-mono">LIVE SNAPSHOTS</span>
          </div>
          <div className="header-icon-pill">
            <ShieldCheck size={14} />
            <span>End-to-End Auth</span>
          </div>
        </div>
      </header>

      {/* Message Feed Canvas */}
      <section className="messages-scroll-canvas" aria-label="Messages Stream">
        {loading ? (
          <div className="canvas-state-center">
            <Loader2 size={24} className="spin text-mute" />
            <p className="state-label">Connecting to Firestore message stream...</p>
          </div>
        ) : error ? (
          <div className="canvas-state-center">
            <AlertCircle size={24} className="text-error" />
            <p className="state-label text-error">Stream error: {error.message}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="canvas-state-center empty-conversation">
            <div className="empty-spark-icon">
              <Users size={32} />
            </div>
            <h3 className="empty-title">Welcome to #{roomName}!</h3>
            <p className="empty-desc">
              This channel was created with high-performance real-time synchronization. Be the first to drop a message.
            </p>
          </div>
        ) : (
          <div className="messages-stack">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.uid === user?.uid;
              const formattedTime = formatTimestamp(msg.createdAt);

              return (
                <div
                  key={msg.id || index}
                  className={`message-row ${isCurrentUser ? 'row-outgoing' : 'row-incoming'}`}
                  data-testid="message-item"
                >
                  {/* Left avatar for incoming messages */}
                  {!isCurrentUser && (
                    <div className="message-avatar-wrap">
                      {msg.photoURL ? (
                        <img
                          src={msg.photoURL}
                          alt={msg.displayName || 'Sender'}
                          className="sender-avatar"
                        />
                      ) : (
                        <div className="sender-avatar-placeholder">
                          {(msg.displayName?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="message-content-wrap">
                    {!isCurrentUser && (
                      <div className="sender-meta-row">
                        <span className="sender-name">{msg.displayName || 'Anonymous'}</span>
                        <span className="message-timestamp-mono">{formattedTime}</span>
                      </div>
                    )}

                    <div className={`message-bubble ${isCurrentUser ? 'bubble-outgoing' : 'bubble-incoming'}`}>
                      <p className="message-text">{msg.text}</p>
                      {isCurrentUser && (
                        <span className="outgoing-time-mono">{formattedTime}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="scroll-anchor" />
          </div>
        )}
      </section>

      {/* Input Bar Area */}
      <footer className="chat-input-dock">
        {sendError && (
          <div className="input-error-banner">
            <AlertCircle size={14} />
            <span>{sendError}</span>
          </div>
        )}
        <form onSubmit={handleSend} className="input-bar-form" data-testid="send-message-form">
          <div className="input-capsule">
            <textarea
              ref={inputRef}
              rows={1}
              className="chat-text-area"
              placeholder={`Message #${roomName || 'channel'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              maxLength={2000}
            />
            <div className="input-actions-cluster">
              <span className="shortcut-hint-mono">
                <CornerDownLeft size={11} /> Return to send
              </span>
              <button
                type="submit"
                className="send-action-btn"
                disabled={isSending || !inputText.trim()}
                title="Send message"
                aria-label="Send Message"
              >
                {isSending ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </form>
      </footer>
    </main>
  );
};

export default ChatRoom;
