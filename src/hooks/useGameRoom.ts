import { useState, useEffect } from 'react';
import { ref, set, onValue, get } from 'firebase/database';
import { db } from '../firebase/config';
import type { GameRoom, Board, Player } from '../types';
import { createInitialBoard } from '../utils/hasamiShogiLogic';

type Role = 'host' | 'guest' | null;

const ROOM_ERRORS = {
  NOT_FOUND: 'ルームが見つかりません',
  ROOM_FULL: 'ルームが満員です',
  INVALID_STATE: 'ゲームの状態が不正です',
} as const;

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useGameRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);

  const updateRoomState = (newRoom: GameRoom, newPlayerId: string) => {
    setRoom(newRoom);
    setPlayerId(newPlayerId);
    setRoomId(newRoom.id);
    setRole(newRoom.hostId === newPlayerId ? 'host' : 'guest');
  };

  const createRoom = async () => {
    const newRoomId = generateId();
    const newPlayerId = generateId();
    
    const newRoom: GameRoom = {
      id: newRoomId,
      hostId: newPlayerId,
      gameState: {
        board: createInitialBoard(),
        currentTurn: '歩',
        status: 'waiting'
      }
    };

    await set(ref(db, `rooms/${newRoomId}`), newRoom);
    updateRoomState(newRoom, newPlayerId);
  };

  const joinRoom = async (roomIdToJoin: string) => {
    const roomRef = ref(db, `rooms/${roomIdToJoin}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val() as GameRoom | null;

    if (!roomData) {
      throw new Error(ROOM_ERRORS.NOT_FOUND);
    }

    if (roomData.guestId) {
      throw new Error(ROOM_ERRORS.ROOM_FULL);
    }

    const newPlayerId = generateId();
    
    const updatedRoom: GameRoom = {
      ...roomData,
      guestId: newPlayerId,
      gameState: {
        ...roomData.gameState,
        status: 'playing'
      }
    };

    await set(roomRef, updatedRoom);
    updateRoomState(updatedRoom, newPlayerId);
    return { roomId: roomIdToJoin, playerId: newPlayerId };
  };

  const updateGameState = async (board: Board, currentTurn: Player) => {
    if (!room?.id || !roomId) {
      throw new Error(ROOM_ERRORS.INVALID_STATE);
    }

    const updatedRoom: GameRoom = {
      ...room,
      gameState: {
        ...room.gameState,
        board,
        currentTurn,
      }
    };

    await set(ref(db, `rooms/${roomId}`), updatedRoom);
  };

  useEffect(() => {
    if (!roomId || !playerId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as GameRoom | null;
      if (data) {
        setRoom(data);
        setRole(data.hostId === playerId ? 'host' : 'guest');
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId]);

  return {
    room,
    role,
    createRoom,
    joinRoom,
    updateGameState,
  };
}; 