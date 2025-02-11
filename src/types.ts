// プレイヤーの型
export type Player = '歩' | 'と';

// 盤面の型
export type Board = (string | null)[][];

// セルの位置を表す型
export type Position = [number, number];

// ゲームのエラー型
export type GameError = {
  message: string;
  code: GameErrorCode;
};

// エラーコードの定義
export enum GameErrorCode {
  INVALID_MOVE = 'INVALID_MOVE',
  INVALID_TURN = 'INVALID_TURN',
  GAME_ENDED = 'GAME_ENDED',
  INVALID_POSITION = 'INVALID_POSITION',
}

// ゲームの状態を表す型
export type GameState = {
  board: Board;
  currentPlayer: Player;
  selectedCell: Position | null;
  winner: Player | null;
  error: GameError | null;
};

// Cellコンポーネントのprops型
export type CellProps = {
  piece: string | null;
  onClick: () => void;
  isSelected: boolean;
}; 