import { FC } from 'react';

type CellProps = {
  piece: string | null;
  onClick: () => void;
  isSelected: boolean;
}

export const Cell: FC<CellProps> = ({ piece, onClick, isSelected }) => {
  return (
    <div
      onClick={onClick}
      className={`
        w-8 h-8 sm:w-14 sm:h-14 flex items-center justify-center
        ${isSelected 
          ? 'bg-yellow-200 hover:bg-yellow-300' 
          : 'bg-yellow-50 hover:bg-yellow-100'
        }
        ${piece ? 'cursor-pointer' : 'cursor-default'}
        text-lg sm:text-2xl font-bold text-gray-800
        transition-colors duration-200 ease-in-out
        border border-gray-300
      `}
    >
      {piece}
    </div>
  );
}; 