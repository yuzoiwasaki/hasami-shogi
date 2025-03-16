import { useState, useEffect } from 'react';
import { ref, set, onValue, update, get } from 'firebase/database';
import { db } from '../firebase/config';
import { GameRoom } from '../types';

export const useGameRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);

  const createRoom = async () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    const playerId = Math.random().toString(36).substring(2, 9);
    
    const newRoom: GameRoom = {
      id: newRoomId,
      hostId: playerId,
      gameState: {
        board: Array(9).fill(null).map(() => Array(9).fill(0)),
        currentTurn: 'host',
        status: 'waiting'
      }
    };

    await set(ref(db, `rooms/${newRoomId}`), newRoom);
    setRoomId(newRoomId);
    return { roomId: newRoomId, playerId };
  };

  const joinRoom = async (roomIdToJoin: string) => {
    const roomRef = ref(db, `rooms/${roomIdToJoin}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val() as GameRoom | null;

    if (!roomData) {
      throw new Error('ルームが見つかりません');
    }

    if (roomData.guestId) {
      throw new Error('ルームが満員です');
    }

    const playerId = Math.random().toString(36).substring(2, 9);
    await update(roomRef, {
      guestId: playerId,
      'gameState.status': 'playing'
    });

    setRoomId(roomIdToJoin);
    return { roomId: roomIdToJoin, playerId };
  };

  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  return {
    room,
    createRoom,
    joinRoom,
    setRoomId
  };
}; 