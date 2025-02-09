import { useState } from 'react';

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

  const handleCellClick = (row: number, col: number) => {
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
      !hasObstacleInPath(selectedRow, selectedCol, row, col) // 経路に他の駒がないこと
    );

    if (isValidMove) {
      // 移動を実行
      const newBoard = [...board.map(row => [...row])];
      newBoard[row][col] = board[selectedRow][selectedCol];
      newBoard[selectedRow][selectedCol] = null;

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">はさみ将棋</h1>
      <div className="text-center mb-4">
        現在の手番: {currentPlayer}
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
