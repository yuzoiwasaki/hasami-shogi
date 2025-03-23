import { Board, Player, GameError, GameErrorCodeType, GameErrorMessages } from '../types';

export const createInitialBoard = (): Board => {
  return Array(9).fill(null).map((_, row) => {
    if (row === 0) return Array(9).fill('と');
    if (row === 8) return Array(9).fill('歩');
    return Array(9).fill(null);
  });
};

// 勝利判定に関連する関数群
export const countPieces = (board: Board): { fuPieces: number; toPieces: number } => {
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

export const hasObstacleInPath = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
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

export const hasValidMove = (
  board: Board,
  currentPlayer: Player,
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
            if (!hasObstacleInPath(board, i, j, newRow, newCol)) {
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

export const checkWinner = (
  board: Board,
  currentPlayer: Player,
): Player | null => {
  const { fuPieces, toPieces } = countPieces(board);

  if (fuPieces === 0) return 'と';
  if (toPieces === 0) return '歩';
  
  if (!hasValidMove(board, currentPlayer)) {
    return currentPlayer === '歩' ? 'と' : '歩';
  }

  return null;
};

// はさみ判定に関連する関数群
export const checkHorizontalCaptures = (
  board: Board,
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

export const checkVerticalCaptures = (
  board: Board,
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

// 駒が動けるかどうかを判定する関数
export const canMove = (
  board: Board,
  row: number,
  col: number
): boolean => {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dx, dy] of directions) {
    for (let distance = 1; distance < 9; distance++) {
      const newRow = row + dx * distance;
      const newCol = col + dy * distance;

      if (newRow < 0 || newRow >= 9 || newCol < 0 || newCol >= 9) break;
      if (board[newRow][newCol] !== null) break;
      if (!hasObstacleInPath(board, row, col, newRow, newCol)) {
        return true;
      } else {
        break;
      }
    }
  }
  return false;
};

// 駒が囲まれているかどうかを判定する関数
export const isPieceSurrounded = (
  board: Board,
  row: number,
  col: number
): boolean => {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const piece = board[row][col];
  if (!piece) return false;
  const opponent = piece === '歩' ? 'と' : '歩';

  // 端の駒の場合
  if (row === 0 || row === 8 || col === 0 || col === 8) {
    let surroundedCount = 0;
    let totalAdjacent = 0;

    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;

      if (newRow < 0 || newRow >= 9 || newCol < 0 || newCol >= 9) continue;
      
      totalAdjacent++;
      if (board[newRow][newCol] === opponent) {
        surroundedCount++;
      }
    }

    // 端の駒の場合、隣接するマスのうち、相手の駒に囲まれているマスの数が
    // 隣接するマスの総数と等しい場合、囲まれていると判定
    return surroundedCount === totalAdjacent;
  }

  // 中央の駒の場合
  for (const [dx, dy] of directions) {
    const newRow = row + dx;
    const newCol = col + dy;

    if (newRow < 0 || newRow >= 9 || newCol < 0 || newCol >= 9) continue;
    if (board[newRow][newCol] !== opponent) {
      return false;
    }
  }

  return true;
};

export const checkCaptures = (
  board: Board,
  row: number,
  col: number,
  piece: string
): [number, number][] => {
  const opponent = piece === '歩' ? 'と' : '歩';
  const horizontalCaptures = checkHorizontalCaptures(board, row, col, piece, opponent);
  const verticalCaptures = checkVerticalCaptures(board, row, col, piece, opponent);
  
  // はさみによる駒の取得
  const captures = [...horizontalCaptures, ...verticalCaptures];
  
  // 相手の駒が囲まれている場合の駒の取得
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === opponent && isPieceSurrounded(board, i, j)) {
        captures.push([i, j]);
      }
    }
  }
  
  return captures;
};

export const isValidMove = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
  return (
    (fromRow === toRow || fromCol === toCol) &&
    !hasObstacleInPath(board, fromRow, fromCol, toRow, toCol) &&
    board[toRow][toCol] === null
  );
};

export const createGameError = (code: GameErrorCodeType): GameError => {
  return {
    code,
    message: GameErrorMessages[code],
  };
}; 