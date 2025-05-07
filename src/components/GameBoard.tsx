import { Cell } from './Cell';
import type { Board, Position } from '../types';

interface GameBoardProps {
  board: Board;
  selectedCell: Position | null;
  handleCellClick: (rowIndex: number, colIndex: number) => void;
}

export function GameBoard({
  board,
  selectedCell,
  handleCellClick,
}: GameBoardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-9 gap-1.5">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              piece={cell}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              isSelected={
                selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex
              }
            />
          ))
        )}
      </div>
    </div>
  );
} 