import { useHasamiShogi } from './useHasamiShogi';
import { useGameRoomContext } from '../contexts/GameRoomContext';

export const useOnlineHasamiShogi = () => {
  const {
    board,
    selectedCell,
    currentPlayer,
    winner,
    error,
    handleCellClick: originalHandleCellClick,
    resetGame,
    getPlayerName,
  } = useHasamiShogi();

  const { room, role } = useGameRoomContext();

  // 自分の手番かどうかをチェック
  const isMyTurn = role !== null && (
    (role === 'host' && currentPlayer === '歩') || 
    (role === 'guest' && currentPlayer === 'と')
  );

  const handleCellClick = async (row: number, col: number) => {
    // 自分の手番でない場合は何もしない
    if (!isMyTurn) return;

    // 元のクリックハンドラを呼び出す
    originalHandleCellClick(row, col);
  };

  return {
    board,
    selectedCell,
    currentPlayer,
    winner,
    error,
    handleCellClick,
    resetGame,
    getPlayerName,
    isMyTurn,
    room,
  };
}; 