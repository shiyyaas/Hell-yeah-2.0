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
 * Custom hook to stream real-time chat rooms from the root '/rooms' collection
 * ordered by 'createdAt'
 */
export const useChatRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const roomsRef = collection(db, 'rooms');
    const roomsQuery = query(roomsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      roomsQuery,
      (snapshot) => {
        const loadedRooms = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setRooms(loadedRooms);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching chat rooms:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Create a new room in the /rooms collection
   * Document fields: name, createdBy, createdAt [serverTimestamp]
   */
  const createRoom = async (roomName, user) => {
    if (!roomName || !roomName.trim()) {
      throw new Error('Room name cannot be empty');
    }
    const trimmedName = roomName.trim();
    const roomsRef = collection(db, 'rooms');
    const newRoomData = {
      name: trimmedName,
      createdBy: user?.displayName || user?.email || 'Anonymous',
      creatorUid: user?.uid || null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(roomsRef, newRoomData);
    return { id: docRef.id, ...newRoomData };
  };

  return { rooms, loading, error, createRoom };
};

export default useChatRooms;
