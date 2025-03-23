import { useState, useEffect, useCallback } from 'react';
import { ref, set, onValue, get, update } from 'firebase/database';
import { db } from '../firebase/config';
import type { GameRoom, Board, Player } from '../types';
import { createInitialBoard } from '../utils/hasamiShogiLogic';

const ROOM_ERRORS = {
  NOT_FOUND: 'ルームが見つかりません',
  ROOM_FULL: '対局室が満員です',
  INVALID_STATE: 'ゲームの状態が不正です',
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

    const roomRef = ref(db, `rooms/${room.id}`);
    const snapshot = await get(roomRef);
    const currentRoom = snapshot.val() as GameRoom | null;

    if (!currentRoom) return;

    // ゲームが終了している場合は部屋を直接削除
    if (currentRoom.gameState.status === 'finished') {
      await set(roomRef, null);
      setRoom(null);
      setPlayerId(null);
      setRoomId(null);
      setIsFirstPlayer(null);
      return;
    }

    if (currentRoom.firstPlayerId === playerId) {
      // 先手が退出した場合
      if (!currentRoom.secondPlayerId) {
        // 後手がいない場合は部屋を削除
        await set(roomRef, null);
      } else {
        // 後手がいる場合は先手を削除
        await set(roomRef, {
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
        });
      }
    } else if (currentRoom.secondPlayerId === playerId) {
      // 後手が退出した場合
      if (!currentRoom.firstPlayerId) {
        // 先手がいない場合は部屋を削除
        await set(roomRef, null);
      } else {
        // 先手がいる場合は後手を削除
        await set(roomRef, {
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
        });
      }
    }

    setRoom(null);
    setPlayerId(null);
    setRoomId(null);
    setIsFirstPlayer(null);
  }, [room?.id, playerId]);

  const enterRoom = async (roomIdToEnter: string) => {
    const roomRef = ref(db, `rooms/${roomIdToEnter}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val() as GameRoom | null;

    const newPlayerId = generateId();

    if (!roomData) {
      // 部屋が存在しない場合は新規作成（先手として入室）
      const newRoom: GameRoom = {
        id: roomIdToEnter,
        firstPlayerId: newPlayerId,
        gameState: {
          board: createInitialBoard(),
          currentTurn: '歩',
          status: 'waiting',
          isFirstPlayerTurn: true,
          firstPlayerTime: INITIAL_TIME,
          secondPlayerTime: INITIAL_TIME,
          lastMoveTime: Date.now(),
        }
      };
      await set(roomRef, newRoom);
      updateRoomState(newRoom, newPlayerId);
      return;
    }

    if (roomData.secondPlayerId) {
      throw new Error(ROOM_ERRORS.ROOM_FULL);
    }

    // 部屋が存在し、後手プレイヤーとして参加
    const updatedRoom: GameRoom = {
      ...roomData,
      secondPlayerId: newPlayerId,
      gameState: {
        ...roomData.gameState,
        status: 'playing'
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
        // 10秒後に部屋を削除
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
    if (!roomId || !playerId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as GameRoom | null;
      if (data) {
        setRoom(data);
        setIsFirstPlayer(data.firstPlayerId === playerId);
      } else {
        // 部屋が削除された場合
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