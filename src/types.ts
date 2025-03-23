// プレイヤーの型
export type Player = '歩' | 'と';

// 盤面の型
export type Board = (string | null)[][];

// セルの位置を表す型
export type Position = [number, number];

// ゲームのエラー型
export type GameError = {
  message: string;
  code: GameErrorCodeType;
};

// エラーコードの定義
export const GameErrorCode = {
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  WRONG_PIECE: 'WRONG_PIECE',
  INVALID_MOVE: 'INVALID_MOVE',
  TIME_UP: 'TIME_UP',
  RESIGNED: 'RESIGNED',
} as const;

// エラーメッセージの定義
export const GameErrorMessages = {
  [GameErrorCode.NOT_YOUR_TURN]: '相手の番です',
  [GameErrorCode.WRONG_PIECE]: '自分の駒を選択してください',
  [GameErrorCode.INVALID_MOVE]: 'そこには移動できません',
  [GameErrorCode.TIME_UP]: '時間切れです',
  [GameErrorCode.RESIGNED]: '投了により対局を終了しました',
} as const;

export type GameErrorCodeType = keyof typeof GameErrorCode;

// Cellコンポーネントのprops型
export type CellProps = {
  piece: string | null;
  onClick: () => void;
  isSelected: boolean;
};

export type GameRoom = {
  id: string;
  firstPlayerId: string;
  secondPlayerId?: string | null;
  gameState: {
    board: Board;
    currentTurn: Player;
    status: 'waiting' | 'playing' | 'finished';
    isFirstPlayerTurn: boolean;
    firstPlayerTime: number;
    secondPlayerTime: number;
    lastMoveTime: number;
    winner?: Player;
  };
};

export type GameState = {
  board: Board;
  currentTurn: Player;
  status: 'waiting' | 'playing' | 'finished';
  isFirstPlayerTurn: boolean;
  firstPlayerTime: number; // 先手の残り時間（秒）
  secondPlayerTime: number; // 後手の残り時間（秒）
  lastMoveTime: number; // 最後の手が打たれた時刻（ミリ秒）
  winner?: Player;
}; 