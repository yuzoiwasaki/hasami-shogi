import { useCallback } from 'react';
import { Board } from '../types';
import { createInitialBoard } from '../utils/hasamiShogiLogic';
import { ref, update, set } from 'firebase/database';
import { db } from '../firebase/config';

interface GameSyncProps {
  room: any | null;
}

export const useGameSync = ({ room }: GameSyncProps) => {
  // 盤面データを配列に変換する関数
  const convertToBoard = useCallback((data: Board | null | undefined): Board => {
    if (!data) return createInitialBoard();

    // 空の9x9盤面を作成
    const board = Array(9).fill(null).map(() => Array(9).fill(null));

    try {
      // データを処理
      for (let i = 0; i < 9; i++) {
        const rowData = data[i];
        
        // 行が配列の場合
        if (Array.isArray(rowData)) {
          for (let j = 0; j < 9; j++) {
            board[i][j] = rowData[j] ?? null;
          }
          continue;
        }
        
        // 行がオブジェクトの場合
        if (rowData && typeof rowData === 'object') {
          // まず行を全てnullで初期化
          board[i] = Array(9).fill(null);
          // 存在する値のみを設定
          Object.entries(rowData).forEach(([j, value]) => {
            if (value !== undefined && value !== null) {
              board[i][Number(j)] = value;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error converting board:', error);
      return createInitialBoard();
    }

    return board;
  }, []);

  // Firebase更新ロジックを共通化
  const updateGameState = useCallback(async (updates: Record<string, unknown>) => {
    if (!room) return;
    await update(ref(db, `rooms/${room.id}/gameState`), updates);
  }, [room]);

  // 部屋の削除
  const deleteRoom = useCallback(async () => {
    if (!room) return;
    const roomRef = ref(db, `rooms/${room.id}`);
    await set(roomRef, null);
  }, [room]);

  return {
    convertToBoard,
    updateGameState,
    deleteRoom,
  };
}; 