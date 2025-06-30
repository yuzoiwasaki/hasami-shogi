import { createContext, useContext, ReactNode } from 'react';
import { useGameRoom } from '../hooks/useGameRoom';
import type { GameRoom } from '../types';

type GameRoomContextType = {
  room: GameRoom | null;
  isFirstPlayer: boolean | null;
  enterRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
};

const GameRoomContext = createContext<GameRoomContextType | null>(null);

export const GameRoomProvider = ({ children }: { children: ReactNode }) => {
  const gameRoom = useGameRoom();

  return (
    <GameRoomContext.Provider value={gameRoom}>
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