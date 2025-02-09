import { useState, useEffect } from 'react';

type CellProps = {
  position: [number, number];
  piece: string | null;
  onClick: () => void;
  isSelected: boolean;
}

function Cell({ position, piece, onClick, isSelected }: CellProps) {
  return (
    <div
      onClick={onClick}
      className={`w-12 h-12 border border-gray-800 flex items-center justify-center bg-yellow-100 cursor-pointer
        ${isSelected ? 'bg-yellow-300' : ''}`}
    >
      {piece}
    </div>
  );
}

function App() {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(9).fill(null).map((_, row) => {
      if (row === 0) return Array(9).fill('●');  // 黒駒
      if (row === 8) return Array(9).fill('○');  // 白駒
      return Array(9).fill(null);
    })
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'●' | '○'>('●');
  const [winner, setWinner] = useState<'●' | '○' | null>(null);

  // 勝利判定
  useEffect(() => {
    const checkWinner = () => {
      // 黒と白の駒の数を数える
      let blackPieces = 0;
      let whitePieces = 0;

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (board[i][j] === '●') blackPieces++;
          if (board[i][j] === '○') whitePieces++;
        }
      }

      // どちらかの駒が全て取られている場合
      if (blackPieces === 0) {
        setWinner('○');
        return;
      }
      if (whitePieces === 0) {
        setWinner('●');
        return;
      }

      // 次のプレイヤーが動けるかチェック
      const nextPlayer = currentPlayer === '●' ? '○' : '●';
      let hasValidMove = false;

      // 盤面全体をチェック
      for (let i = 0; i < 9 && !hasValidMove; i++) {
        for (let j = 0; j < 9 && !hasValidMove; j++) {
          if (board[i][j] === nextPlayer) {
            // 上下左右の各方向について、1マスから8マス先までチェック
            const directions = [
              [-1, 0], // 上
              [1, 0],  // 下
              [0, -1], // 左
              [0, 1]   // 右
            ];

            for (const [dx, dy] of directions) {
              // 各方向に1マスから8マスまでチェック
              for (let distance = 1; distance < 9; distance++) {
                const newRow = i + dx * distance;
                const newCol = j + dy * distance;

                // 盤面の範囲内かチェック
                if (newRow < 0 || newRow >= 9 || newCol < 0 || newCol >= 9) {
                  break; // この方向はもう調べる必要なし
                }

                // 移動先に駒があれば、この方向はもう調べる必要なし
                if (board[newRow][newCol] !== null) {
                  break;
                }

                // 移動可能な場所を見つけた
                if (!hasObstacleInPath(i, j, newRow, newCol)) {
                  hasValidMove = true;
                  break;
                }
              }

              if (hasValidMove) break;
            }
          }
        }
      }

      // 次のプレイヤーが動けない場合
      if (!hasValidMove) {
        setWinner(currentPlayer);
      }
    };

    checkWinner();
  }, [board, currentPlayer]);

  // はさみ判定を行う関数
  const checkCaptures = (row: number, col: number, piece: string) => {
    const opponent = piece === '●' ? '○' : '●';
    let capturedPositions: [number, number][] = [];

    // 横方向のチェック
    const checkHorizontal = () => {
      // 左方向
      if (col >= 2) {
        if (board[row][col-1] === opponent && board[row][col-2] === piece) {
          capturedPositions.push([row, col-1]);
        }
      }
      // 右方向
      if (col <= 6) {
        if (board[row][col+1] === opponent && board[row][col+2] === piece) {
          capturedPositions.push([row, col+1]);
        }
      }
    };

    // 縦方向のチェック
    const checkVertical = () => {
      // 上方向
      if (row >= 2) {
        if (board[row-1][col] === opponent && board[row-2][col] === piece) {
          capturedPositions.push([row-1, col]);
        }
      }
      // 下方向
      if (row <= 6) {
        if (board[row+1][col] === opponent && board[row+2][col] === piece) {
          capturedPositions.push([row+1, col]);
        }
      }
    };

    checkHorizontal();
    checkVertical();
    return capturedPositions;
  };

  const handleCellClick = (row: number, col: number) => {
    if (winner) return; // ゲーム終了後は操作を無効化

    // 駒が選択されていない場合
    if (!selectedCell) {
      // クリックしたマスに現在のプレイヤーの駒がある場合のみ選択可能
      if (board[row][col] === currentPlayer) {
        setSelectedCell([row, col]);
      }
      return;
    }

    // 駒が選択されている場合
    const [selectedRow, selectedCol] = selectedCell;

    // 同じマスをクリックした場合は選択解除
    if (selectedRow === row && selectedCol === col) {
      setSelectedCell(null);
      return;
    }

    // 移動可能かチェック（縦・横の直線移動のみ許可）
    const isValidMove = (
      (selectedRow === row || selectedCol === col) && // 縦か横の移動
      !hasObstacleInPath(selectedRow, selectedCol, row, col) && // 経路に他の駒がないこと
      board[row][col] === null // 移動先のマスが空いていること
    );

    if (isValidMove) {
      // 移動を実行
      const newBoard = [...board.map(row => [...row])];
      const movingPiece = board[selectedRow][selectedCol];
      newBoard[row][col] = movingPiece;
      newBoard[selectedRow][selectedCol] = null;

      // はさみ判定と駒を取る処理
      const capturedPositions = checkCaptures(row, col, movingPiece!);
      capturedPositions.forEach(([captureRow, captureCol]) => {
        newBoard[captureRow][captureCol] = null;
      });

      setBoard(newBoard);
      setSelectedCell(null);
      setCurrentPlayer(currentPlayer === '●' ? '○' : '●');
    }
  };

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

  const resetGame = () => {
    setBoard(Array(9).fill(null).map((_, row) => {
      if (row === 0) return Array(9).fill('●');
      if (row === 8) return Array(9).fill('○');
      return Array(9).fill(null);
    }));
    setSelectedCell(null);
    setCurrentPlayer('●');
    setWinner(null);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">はさみ将棋</h1>
      <div className="text-center mb-4">
        {winner ? (
          <div>
            <div className="text-xl font-bold mb-2">
              {winner}の勝利！
            </div>
            <button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              もう一度プレイ
            </button>
          </div>
        ) : (
          <div>現在の手番: {currentPlayer}</div>
        )}
      </div>
      <div className="max-w-fit mx-auto">
        <div className="grid grid-cols-9 gap-0">
          {board.map((row, i) =>
            row.map((piece, j) => (
              <Cell
                key={`${i}-${j}`}
                position={[i, j]}
                piece={piece}
                onClick={() => handleCellClick(i, j)}
                isSelected={selectedCell ? selectedCell[0] === i && selectedCell[1] === j : false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
