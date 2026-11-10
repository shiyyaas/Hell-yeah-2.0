import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Custom hook to stream real-time chat messages for a specific roomId
 * Message sub-collection at /rooms/{roomId}/messages ordered by 'createdAt' in ascending order ('asc')
 */
export const useChatMessages = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loadedMessages = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setMessages(loadedMessages);
        setLoading(false);
      },
      (err) => {
        console.error(`Error streaming messages for room ${roomId}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  /**
   * Send a new message to /rooms/{roomId}/messages
   * Document fields: text, uid, displayName, photoURL, createdAt [serverTimestamp]
   */
  const sendMessage = async (text, user) => {
    if (!roomId) {
      throw new Error('No active room selected');
    }
    if (!text || !text.trim()) {
      throw new Error('Message text cannot be empty');
    }
    if (!user) {
      throw new Error('User must be authenticated to send messages');
    }

    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const newMessageData = {
      text: text.trim(),
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(messagesRef, newMessageData);
    return { id: docRef.id, ...newMessageData };
  };

  return { messages, loading, error, sendMessage };
};

export default useChatMessages;
