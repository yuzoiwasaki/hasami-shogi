import { useState, useEffect, useCallback } from 'react';
import { Player } from '../types';
import { DEFAULT_TIME } from '../constants/rooms';

interface GameTimerProps {
  room: any | null;
}

export const useGameTimer = ({ room }: GameTimerProps) => {
  const [localFirstPlayerTime, setLocalFirstPlayerTime] = useState<number>(DEFAULT_TIME);
  const [localSecondPlayerTime, setLocalSecondPlayerTime] = useState<number>(DEFAULT_TIME);

  const calculateTimeElapsed = useCallback(() => {
    if (!room?.gameState.lastMoveTime) return 0;
    return Math.floor((Date.now() - room.gameState.lastMoveTime) / 1000);
  }, [room?.gameState.lastMoveTime]);

  const calculatePlayerTimes = useCallback((currentTurn: Player) => {
    if (!room) return { firstPlayerTime: DEFAULT_TIME, secondPlayerTime: DEFAULT_TIME };
    
    const timeElapsed = calculateTimeElapsed();
    const firstPlayerTime = currentTurn === '歩'
      ? Math.max(0, room.gameState.firstPlayerTime - timeElapsed)
      : room.gameState.firstPlayerTime;
    const secondPlayerTime = currentTurn === 'と'
      ? Math.max(0, room.gameState.secondPlayerTime - timeElapsed)
      : room.gameState.secondPlayerTime;
    
    return { firstPlayerTime, secondPlayerTime };
  }, [room?.gameState.firstPlayerTime, room?.gameState.secondPlayerTime, calculateTimeElapsed]);

  const updateLocalTimes = useCallback(() => {
    if (!room) return;
    
    if (room.gameState.status === 'waiting' || !room.gameState.lastMoveTime) {
      setLocalFirstPlayerTime(DEFAULT_TIME);
      setLocalSecondPlayerTime(DEFAULT_TIME);
      return;
    }

    if (room.gameState.status === 'playing') {
      const { firstPlayerTime, secondPlayerTime } = calculatePlayerTimes(room.gameState.currentTurn);
      setLocalFirstPlayerTime(firstPlayerTime);
      setLocalSecondPlayerTime(secondPlayerTime);
    }
  }, [room?.gameState.status, room?.gameState.lastMoveTime, room?.gameState.currentTurn, calculatePlayerTimes]);

  useEffect(() => {
    updateLocalTimes();
  }, [updateLocalTimes]);

  useEffect(() => {
    if (!room || room.gameState.status !== 'playing') return;

    const timer = setInterval(updateLocalTimes, 100);
    return () => clearInterval(timer);
  }, [room?.gameState.status, updateLocalTimes]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeDisplay = useCallback(() => {
    if (!room) return null;
    return {
      firstPlayer: formatTime(localFirstPlayerTime),
      secondPlayer: formatTime(localSecondPlayerTime),
    };
  }, [room, localFirstPlayerTime, localSecondPlayerTime]);

  const isTimeUp = useCallback(() => {
    if (!room || room.gameState.status !== 'playing') return false;
    
    const currentPlayerTime = room.gameState.currentTurn === '歩'
      ? localFirstPlayerTime
      : localSecondPlayerTime;

    return currentPlayerTime <= 0;
  }, [room, localFirstPlayerTime, localSecondPlayerTime]);

  const getCurrentPlayerTime = useCallback(() => {
    if (!room || room.gameState.status !== 'playing') return DEFAULT_TIME;
    
    return room.gameState.currentTurn === '歩'
      ? localFirstPlayerTime
      : localSecondPlayerTime;
  }, [room, localFirstPlayerTime, localSecondPlayerTime]);

  return {
    localFirstPlayerTime,
    localSecondPlayerTime,
    getTimeDisplay,
    isTimeUp,
    getCurrentPlayerTime,
    calculatePlayerTimes,
  };
}; 