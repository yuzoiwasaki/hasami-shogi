import { FC } from 'react';

type CellProps = {
  position: [number, number];
  piece: string | null;
  onClick: () => void;
  isSelected: boolean;
}

export const Cell: FC<CellProps> = ({ position, piece, onClick, isSelected }) => {
  return (
    <div
      onClick={onClick}
      className={`w-12 h-12 border border-gray-800 flex items-center justify-center bg-yellow-100 cursor-pointer
        ${isSelected ? 'bg-yellow-300' : ''}`}
    >
      {piece}
    </div>
  );
}; 