import React from 'react';
import { useState } from 'react';

type CellProps = {
  position: [number, number];
  piece: string | null;
}

function Cell({ position, piece }: CellProps) {
  return (
    <div className="w-12 h-12 border border-gray-800 flex items-center justify-center bg-yellow-100">
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
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">はさみ将棋</h1>
      <div className="max-w-fit mx-auto">
        <div className="grid grid-cols-9 gap-0">
          {board.map((row, i) =>
            row.map((piece, j) => (
              <Cell
                key={`${i}-${j}`}
                position={[i, j]}
                piece={piece}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
