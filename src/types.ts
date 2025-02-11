// プレイヤーの型
export type Player = '歩' | 'と';

// 盤面の型
export type Board = (string | null)[][];

// セルの位置を表す型
export type Position = [number, number];

// ゲームの状態を表す型
export type GameState = {
  board: Board;
  currentPlayer: Player;
  selectedCell: Position | null;
  winner: Player | null;
};

// Cellコンポーネントのprops型
export type CellProps = {
  piece: string | null;
  onClick: () => void;
  isSelected: boolean;
}; 