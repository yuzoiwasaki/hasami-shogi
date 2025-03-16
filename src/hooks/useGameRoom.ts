import { useState, useEffect } from 'react';
import { ref, set, onValue, get } from 'firebase/database';
import { db } from '../firebase/config';
import { GameRoom } from '../types';

export const useGameRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [role, setRole] = useState<'host' | 'guest' | null>(null);

  const createRoom = async () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    const newPlayerId = Math.random().toString(36).substring(2, 9);
    
    const newRoom: GameRoom = {
      id: newRoomId,
      hostId: newPlayerId,
      gameState: {
        board: Array(9).fill(null).map(() => Array(9).fill(0)),
        currentTurn: 'host',
        status: 'waiting'
      }
    };

    await set(ref(db, `rooms/${newRoomId}`), newRoom);
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
    setRole('host');
    return { roomId: newRoomId, playerId: newPlayerId };
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

    const newPlayerId = Math.random().toString(36).substring(2, 9);
    
    const updatedRoom = {
      ...roomData,
      guestId: newPlayerId,
      gameState: {
        ...roomData.gameState,
        status: 'playing'
      }
    };

    await set(roomRef, updatedRoom);
    setRoomId(roomIdToJoin);
    setPlayerId(newPlayerId);
    setRole('guest');
    return { roomId: roomIdToJoin, playerId: newPlayerId };
  };

  useEffect(() => {
    if (!roomId || !playerId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as GameRoom | null;
      if (data) {
        setRoom(data);
        if (data.hostId === playerId) {
          setRole('host');
        } else if (data.guestId === playerId) {
          setRole('guest');
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId]);

  return {
    room,
    playerId,
    role,
    createRoom,
    joinRoom,
    setRoomId
  };
}; 