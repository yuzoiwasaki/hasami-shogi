import { useState, useEffect, useCallback } from 'react';
import { ref, set, onValue, get, update } from 'firebase/database';
import { db } from '../firebase/config';
import type { GameRoom, Board, Player } from '../types';
import { createInitialBoard } from '../utils/hasamiShogiLogic';

const ROOM_ERRORS = {
  NOT_FOUND: '対局室が見つかりません',
  ROOM_FULL: '対局室が満員です',
  INVALID_STATE: '対局の状態が不正です',
  NOT_YOUR_TURN: 'あなたの手番ではありません',
} as const;

export const INITIAL_TIME = 300; // 5分（秒）

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useGameRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isFirstPlayer, setIsFirstPlayer] = useState<boolean | null>(null);

  const leaveRoom = useCallback(async () => {
    if (!room?.id || !playerId) return;

    try {
      const roomRef = ref(db, `rooms/${room.id}`);
      const snapshot = await get(roomRef);
      const currentRoom = snapshot.val() as GameRoom | null;

      if (!currentRoom) return;

      // 対局開始前の場合は必ず対局室を削除
      if (currentRoom.gameState.status === 'waiting') {
        await set(roomRef, null);
        setRoom(null);
        setPlayerId(null);
        setRoomId(null);
        setIsFirstPlayer(null);
        return;
      }

      // 対局終了時も対局室を削除
      if (currentRoom.gameState.status === 'finished') {
        await set(roomRef, null);
        setRoom(null);
        setPlayerId(null);
        setRoomId(null);
        setIsFirstPlayer(null);
        return;
      }

      // プレイ中の場合の処理
      if (currentRoom.firstPlayerId === playerId) {
        // 先手が退出
        await set(roomRef, currentRoom.secondPlayerId ? {
          ...currentRoom,
          firstPlayerId: currentRoom.secondPlayerId,
          secondPlayerId: null,
          gameState: {
            ...currentRoom.gameState,
            status: 'waiting',
            isFirstPlayerTurn: true,
            firstPlayerTime: INITIAL_TIME,
            secondPlayerTime: INITIAL_TIME,
            lastMoveTime: Date.now(),
          }
        } : null);
      } else if (currentRoom.secondPlayerId === playerId) {
        // 後手が退出
        await set(roomRef, currentRoom.firstPlayerId ? {
          ...currentRoom,
          secondPlayerId: null,
          gameState: {
            ...currentRoom.gameState,
            status: 'waiting',
            isFirstPlayerTurn: true,
            firstPlayerTime: INITIAL_TIME,
            secondPlayerTime: INITIAL_TIME,
            lastMoveTime: Date.now(),
          }
        } : null);
      }

      setRoom(null);
      setPlayerId(null);
      setRoomId(null);
      setIsFirstPlayer(null);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [room?.id, playerId]);

  const enterRoom = async (roomIdToEnter: string) => {
    const roomRef = ref(db, `rooms/${roomIdToEnter}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val() as GameRoom | null;

    const newPlayerId = generateId();

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
          firstPlayerTime: INITIAL_TIME,
          secondPlayerTime: INITIAL_TIME,
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
        firstPlayerTime: INITIAL_TIME,
        secondPlayerTime: INITIAL_TIME
      }
    };

    await set(roomRef, updatedRoom);
    updateRoomState(updatedRoom, newPlayerId);
  };

  const updateGameState = useCallback(async (board: Board, currentTurn: Player, isFirstPlayerTurn: boolean) => {
    if (!room) return;

    try {
      // 勝者判定
      const firstPlayerCount = board.flat().filter(cell => cell === '歩').length;
      const secondPlayerCount = board.flat().filter(cell => cell === 'と').length;

      if (firstPlayerCount === 0 || secondPlayerCount === 0) {
        const winner = firstPlayerCount === 0 ? 'と' : '歩';
        // 勝利状態を更新
        await update(ref(db, `rooms/${room.id}/gameState`), {
          board,
          currentTurn,
          status: 'finished',
          winner
        });
        // 10秒後に対局室を削除
        setTimeout(async () => {
          const roomRef = ref(db, `rooms/${room.id}`);
          await set(roomRef, null);
        }, 10000);
      } else {
        // 通常の手
        await update(ref(db, `rooms/${room.id}/gameState`), {
          board,
          currentTurn,
          status: 'playing',
          isFirstPlayerTurn
        });
      }
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  }, [room]);

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
        setRoom(null);
        setPlayerId(null);
        setRoomId(null);
        setIsFirstPlayer(null);
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId]);

  return {
    room,
    isFirstPlayer,
    enterRoom,
    leaveRoom,
    updateGameState,
  };
}; 