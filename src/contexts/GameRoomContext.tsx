import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useGameRoom } from '../hooks/useGameRoom';
import type { GameRoom, Board, Player } from '../types';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase/config';
import { checkWinner } from '../utils/hasamiShogiLogic';

type GameRoomContextType = {
  room: GameRoom | null;
  isFirstPlayer: boolean | null;
  enterRoom: (roomId: string) => Promise<void>;
  updateGameState: (board: Board, currentTurn: Player, isFirstPlayerTurn: boolean) => Promise<void>;
  leaveRoom: () => Promise<void>;
};

const GameRoomContext = createContext<GameRoomContextType | null>(null);

export const GameRoomProvider = ({ children }: { children: ReactNode }) => {
  const gameRoom = useGameRoom();

  const updateGameState = useCallback(async (
    board: Board,
    currentTurn: Player,
    isFirstPlayerTurn: boolean
  ) => {
    if (!gameRoom.room) return;

    try {
      const roomRef = ref(db, `rooms/${gameRoom.room.id}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        throw new Error('Room not found');
      }

      const currentState = snapshot.val().gameState;
      const newState = { ...currentState, board, currentTurn, isFirstPlayerTurn };

      // 勝者判定
      if (newState.status === 'playing') {
        const winner = checkWinner(board, currentTurn);
        if (winner) {
          newState.status = 'finished';
          newState.winner = winner;
        }
      }

      await update(roomRef, { gameState: newState });
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  }, [gameRoom.room]);

  return (
    <GameRoomContext.Provider value={{ ...gameRoom, updateGameState }}>
      {children}
    </GameRoomContext.Provider>
  );
};

export const useGameRoomContext = () => {
  const context = useContext(GameRoomContext);
  if (!context) {
    throw new Error('useGameRoomContext must be used within a GameRoomProvider');
  }
  return context;
}; 