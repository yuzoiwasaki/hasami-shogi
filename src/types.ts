// プレイヤーの型
export type Player = '歩' | 'と';

// 盤面の型
export type Board = (Player | null)[][];

// セルの位置を表す型
export type Position = [number, number];

// ゲームのエラー型
export type GameError = {
  code: GameErrorCode;
  message: string;
};

// エラーコードの定義
export enum GameErrorCode {
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  WRONG_PIECE = 'WRONG_PIECE',
  INVALID_MOVE = 'INVALID_MOVE',
  TIME_UP = 'TIME_UP',
}

// エラーメッセージの定義
export const GameErrorMessages: Record<GameErrorCode, string> = {
  [GameErrorCode.NOT_YOUR_TURN]: '相手の番です',
  [GameErrorCode.WRONG_PIECE]: '自分の駒を選択してください',
  [GameErrorCode.INVALID_MOVE]: 'そこには移動できません',
  [GameErrorCode.TIME_UP]: '時間切れです',
};

export type GameErrorCodeType = GameErrorCode;

// Cellコンポーネントのprops型
export type CellProps = {
  piece: string | null;
  onClick: () => void;
  isSelected: boolean;
};

export type GameState = {
  status: 'waiting' | 'playing' | 'finished';
  currentTurn: Player;
  board: Board;
  firstPlayerId: string | null;
  secondPlayerId: string | null;
  winner: Player | null;
  error: GameError | null;
  firstPlayerTime: number;
  secondPlayerTime: number;
  lastMoveTime: number;
  isFirstPlayerTurn: boolean;
};

export type GameRoom = {
  id: string;
  firstPlayerId: string | null;
  secondPlayerId: string | null;
  gameState: GameState;
};

export type RoomStatus = {
  status: 'waiting' | 'playing';
  players: number;
}; 