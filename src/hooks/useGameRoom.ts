import { useState, useEffect, useCallback } from 'react';
import { ref, set, onValue, get, onDisconnect } from 'firebase/database';
import { db } from '../firebase/config';
import type { GameRoom } from '../types';
import { createInitialBoard } from '../utils/hasamiShogiLogic';
import { DEFAULT_TIME, ROOM_ERRORS, SHOGI_ROOMS } from '../constants/rooms';

const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const useGameRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isFirstPlayer, setIsFirstPlayer] = useState<boolean | null>(null);

  // 共通処理の関数化
  const getRoomConfig = useCallback((roomId: string) => {
    const room = SHOGI_ROOMS.find(r => r.id === roomId);
    return {
      room,
      initialTime: room?.initialTime || DEFAULT_TIME
    };
  }, []);

  const resetRoomState = useCallback(() => {
    setRoom(null);
    setPlayerId(null);
    setRoomId(null);
    setIsFirstPlayer(null);
  }, []);

  // 接続が切れた時に部屋を削除
  useEffect(() => {
    if (room?.id && playerId && room.gameState.status === 'waiting') {
      const roomRef = ref(db, `rooms/${room.id}`);
      const disconnectRef = onDisconnect(roomRef);
      disconnectRef.set(null).catch(error => {
        console.error('Error setting up disconnect cleanup:', error);
      });

      return () => {
        disconnectRef.cancel();
      };
    }
  }, [room?.id, playerId, room?.gameState.status]);

  const leaveRoom = useCallback(async () => {
    if (!room?.id || !playerId) return;

    try {
      const roomRef = ref(db, `rooms/${room.id}`);
      const snapshot = await get(roomRef);
      const currentRoom = snapshot.val() as GameRoom | null;

      if (!currentRoom) return;

      // 対局開始前または対局終了時は対局室を削除
      if (currentRoom.gameState.status === 'waiting' || currentRoom.gameState.status === 'finished') {
        await set(roomRef, null);
        resetRoomState();
        return;
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      // エラー時も状態をリセット
      resetRoomState();
    }
  }, [room?.id, playerId, resetRoomState]);

  const enterRoom = async (roomIdToEnter: string) => {
    const roomRef = ref(db, `rooms/${roomIdToEnter}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val() as GameRoom | null;

    const newPlayerId = generateId();
    const { initialTime } = getRoomConfig(roomIdToEnter);

    if (!roomData) {
      // 対局室が存在しない場合は新規作成（先手として入室）
      const newRoom: GameRoom = {
        id: roomIdToEnter,
        firstPlayerId: newPlayerId,
        secondPlayerId: null,
        gameState: {
          board: createInitialBoard(),
          currentTurn: '歩',
          status: 'waiting',  // 対局開始前
          isFirstPlayerTurn: true,
          firstPlayerTime: initialTime,
          secondPlayerTime: initialTime,
          lastMoveTime: Date.now(),
          firstPlayerId: newPlayerId,
          secondPlayerId: null,
          winner: null,
          error: null,
        }
      };
      await set(roomRef, newRoom);
      updateRoomState(newRoom, newPlayerId);
      return;
    }

    if (roomData.secondPlayerId) {
      throw new Error(ROOM_ERRORS.ROOM_FULL);
    }

    // 対局室が存在し、後手プレイヤーとして参加
    const updatedRoom: GameRoom = {
      ...roomData,
      secondPlayerId: newPlayerId,
      gameState: {
        ...roomData.gameState,
        status: 'playing',
        lastMoveTime: Date.now(),
        firstPlayerTime: initialTime,
        secondPlayerTime: initialTime
      }
    };

    await set(roomRef, updatedRoom);
    updateRoomState(updatedRoom, newPlayerId);
  };

  const updateRoomState = (newRoom: GameRoom, newPlayerId: string) => {
    setRoom(newRoom);
    setPlayerId(newPlayerId);
    setRoomId(newRoom.id);
    setIsFirstPlayer(newRoom.firstPlayerId === newPlayerId);
  };

  // 部屋の状態監視
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as GameRoom | null;
      if (data) {
        setRoom(data);
        setIsFirstPlayer(playerId ? data.firstPlayerId === playerId : null);
      } else {
        // 対局室が削除された場合
        resetRoomState();
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId, resetRoomState]);

  return {
    room,
    isFirstPlayer,
    enterRoom,
    leaveRoom,
  };
}; 