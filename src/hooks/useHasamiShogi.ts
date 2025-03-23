import { useState, useEffect } from 'react';
import { Player, Board, Position, GameError, GameErrorCode } from '../types';
import {
  createInitialBoard,
  checkCaptures,
  isValidMove,
  checkWinner,
  createGameError,
} from '../utils/hasamiShogiLogic';

export const useHasamiShogi = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('歩');
  const [winner, setWinner] = useState<Player | null>(null);
  const [error, setError] = useState<GameError | null>(null);

  // 勝利判定
  useEffect(() => {
    const currentWinner = checkWinner(board, currentPlayer);
    if (currentWinner) setWinner(currentWinner);
  }, [board, currentPlayer]);

  const handleCellClick = (row: number, col: number) => {
    setError(null);

    if (winner) {
      return;
    }

    if (!selectedCell) {
      if (board[row][col] === currentPlayer) {
        setSelectedCell([row, col]);
      } else if (board[row][col] !== null) {
        setError(createGameError(GameErrorCode.WRONG_PIECE));
      }
      return;
    }

    const [selectedRow, selectedCol] = selectedCell;

    if (selectedRow === row && selectedCol === col) {
      // 選択解除
      setSelectedCell(null);
      return;
    }

    if (isValidMove(board, selectedRow, selectedCol, row, col)) {
      // 駒の移動を試みる
      const newBoard = board.map(row => [...row]);
      const movingPiece = board[selectedRow][selectedCol];
      newBoard[row][col] = movingPiece;
      newBoard[selectedRow][selectedCol] = null;

      // 挟んだ駒を取る
      const capturedPositions = checkCaptures(newBoard, row, col, currentPlayer);
      capturedPositions.forEach(([r, c]) => {
        newBoard[r][c] = null;
      });

      // 次の手番を計算
      const nextTurn: Player = currentPlayer === '歩' ? 'と' : '歩';

      setBoard(newBoard);
      setCurrentPlayer(nextTurn);
      setSelectedCell(null);
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedCell(null);
    setCurrentPlayer('歩');
    setWinner(null);
    setError(null);
  };

  return {
    board,
    selectedCell,
    currentPlayer,
    winner,
    error,
    handleCellClick,
    resetGame,
  };
}; 