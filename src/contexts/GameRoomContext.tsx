import { createContext, useContext, ReactNode } from 'react';
import { useGameRoom } from '../hooks/useGameRoom';

const GameRoomContext = createContext<ReturnType<typeof useGameRoom> | null>(null);

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