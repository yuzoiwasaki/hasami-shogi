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
  INVALID_TURN = 'INVALID_TURN',
}

// Cellコンポーネントのprops型
export type CellProps = {
  piece: string | null;
  onClick: () => void;
  isSelected: boolean;
};

export type GameRoom = {
  id: string;
  hostId: string;
  guestId?: string;
  gameState: {
    board: Board;
    currentTurn: Player;
    status: 'waiting' | 'playing' | 'finished';
  };
}; 