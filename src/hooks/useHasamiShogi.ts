import { useState, useEffect } from 'react';

type Player = '歩' | 'と';

const createInitialBoard = (): (string | null)[][] => {
  return Array(9).fill(null).map((_, row) => {
    if (row === 0) return Array(9).fill('と');
    if (row === 8) return Array(9).fill('歩');
    return Array(9).fill(null);
  });
};

// 勝利判定に関連する関数群
const countPieces = (board: (string | null)[][]): { fuPieces: number; toPieces: number } => {
  let fuPieces = 0;
  let toPieces = 0;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === '歩') fuPieces++;
      if (board[i][j] === 'と') toPieces++;
    }
  }

  return { fuPieces, toPieces };
};

const hasValidMove = (
  board: (string | null)[][],
  currentPlayer: Player,
  hasObstacleInPath: (fromRow: number, fromCol: number, toRow: number, toCol: number) => boolean
): boolean => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === currentPlayer) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dx, dy] of directions) {
          for (let distance = 1; distance < 9; distance++) {
            const newRow = i + dx * distance;
            const newCol = j + dy * distance;

            if (newRow < 0 || newRow >= 9 || newCol < 0 || newCol >= 9) break;
            if (board[newRow][newCol] !== null) break;
            if (!hasObstacleInPath(i, j, newRow, newCol)) {
              return true;
            } else {
              break;
            }
          }
        }
      }
    }
  }
  return false;
};

const checkWinner = (
  board: (string | null)[][],
  currentPlayer: Player,
  hasObstacleInPath: (fromRow: number, fromCol: number, toRow: number, toCol: number) => boolean
): Player | null => {
  const { fuPieces, toPieces } = countPieces(board);

  if (fuPieces === 0) return 'と';
  if (toPieces === 0) return '歩';
  
  if (!hasValidMove(board, currentPlayer, hasObstacleInPath)) {
    return currentPlayer === '歩' ? 'と' : '歩';
  }

  return null;
};

// はさみ判定に関連する関数群
const checkHorizontalCaptures = (
  board: (string | null)[][],
  row: number,
  col: number,
  piece: string,
  opponent: string
): [number, number][] => {
  const capturedPositions: [number, number][] = [];

  // 左方向
  if (col >= 2) {
    let captureCount = 0;
    let currentCol = col - 1;
    while (currentCol >= 0 && board[row][currentCol] === opponent) {
      captureCount++;
      currentCol--;
    }
    if (captureCount > 0 && currentCol >= 0 && board[row][currentCol] === piece) {
      for (let i = 1; i <= captureCount; i++) {
        capturedPositions.push([row, col - i]);
      }
    }
  }

  // 右方向
  if (col <= 6) {
    let captureCount = 0;
    let currentCol = col + 1;
    while (currentCol < 9 && board[row][currentCol] === opponent) {
      captureCount++;
      currentCol++;
    }
    if (captureCount > 0 && currentCol < 9 && board[row][currentCol] === piece) {
      for (let i = 1; i <= captureCount; i++) {
        capturedPositions.push([row, col + i]);
      }
    }
  }

  return capturedPositions;
};

const checkVerticalCaptures = (
  board: (string | null)[][],
  row: number,
  col: number,
  piece: string,
  opponent: string
): [number, number][] => {
  const capturedPositions: [number, number][] = [];

  // 上方向
  if (row >= 2) {
    let captureCount = 0;
    let currentRow = row - 1;
    while (currentRow >= 0 && board[currentRow][col] === opponent) {
      captureCount++;
      currentRow--;
    }
    if (captureCount > 0 && currentRow >= 0 && board[currentRow][col] === piece) {
      for (let i = 1; i <= captureCount; i++) {
        capturedPositions.push([row - i, col]);
      }
    }
  }

  // 下方向
  if (row <= 6) {
    let captureCount = 0;
    let currentRow = row + 1;
    while (currentRow < 9 && board[currentRow][col] === opponent) {
      captureCount++;
      currentRow++;
    }
    if (captureCount > 0 && currentRow < 9 && board[currentRow][col] === piece) {
      for (let i = 1; i <= captureCount; i++) {
        capturedPositions.push([row + i, col]);
      }
    }
  }

  return capturedPositions;
};

const checkCaptures = (
  board: (string | null)[][],
  row: number,
  col: number,
  piece: string
): [number, number][] => {
  const opponent = piece === '歩' ? 'と' : '歩';
  const horizontalCaptures = checkHorizontalCaptures(board, row, col, piece, opponent);
  const verticalCaptures = checkVerticalCaptures(board, row, col, piece, opponent);
  
  return [...horizontalCaptures, ...verticalCaptures];
};

export const useHasamiShogi = () => {
  const [board, setBoard] = useState<(string | null)[][]>(createInitialBoard());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('歩');
  const [winner, setWinner] = useState<Player | null>(null);

  // 移動経路に他の駒がないかチェック
  const hasObstacleInPath = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    if (fromRow === toRow) {  // 横移動
      const start = Math.min(fromCol, toCol);
      const end = Math.max(fromCol, toCol);
      for (let col = start + 1; col < end; col++) {
        if (board[fromRow][col] !== null) return true;
      }
    } else if (fromCol === toCol) {  // 縦移動
      const start = Math.min(fromRow, toRow);
      const end = Math.max(fromRow, toRow);
      for (let row = start + 1; row < end; row++) {
        if (board[row][fromCol] !== null) return true;
      }
    }
    return false;
  };

  // 勝利判定
  useEffect(() => {
    const winner = checkWinner(board, currentPlayer, hasObstacleInPath);
    if (winner) setWinner(winner);
  }, [board, currentPlayer]);

  const handleCellClick = (row: number, col: number) => {
    if (winner) return;

    if (!selectedCell) {
      if (board[row][col] === currentPlayer) {
        setSelectedCell([row, col]);
      }
      return;
    }

    const [selectedRow, selectedCol] = selectedCell;

    if (selectedRow === row && selectedCol === col) {
      setSelectedCell(null);
      return;
    }

    const isValidMove = (
      (selectedRow === row || selectedCol === col) &&
      !hasObstacleInPath(selectedRow, selectedCol, row, col) &&
      board[row][col] === null
    );

    if (isValidMove) {
      const newBoard = [...board.map(row => [...row])];
      const movingPiece = board[selectedRow][selectedCol];
      newBoard[row][col] = movingPiece;
      newBoard[selectedRow][selectedCol] = null;

      const capturedPositions = checkCaptures(newBoard, row, col, movingPiece!);
      capturedPositions.forEach(([captureRow, captureCol]) => {
        newBoard[captureRow][captureCol] = null;
      });

      setBoard(newBoard);
      setSelectedCell(null);
      setCurrentPlayer(currentPlayer === '歩' ? 'と' : '歩');
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedCell(null);
    setCurrentPlayer('歩');
    setWinner(null);
  };

  const getPlayerName = (piece: Player) => {
    return piece === '歩' ? '先手' : '後手';
  };

  return {
    board,
    selectedCell,
    currentPlayer,
    winner,
    handleCellClick,
    resetGame,
    getPlayerName,
  };
}; 