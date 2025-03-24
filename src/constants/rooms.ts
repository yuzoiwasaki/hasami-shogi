export const SHOGI_ROOMS = [
  { id: 'special', name: '特別対局室' },
  { id: 'takao', name: '高雄の間' },
  { id: 'kiho', name: '棋峰の間' },
  { id: 'unkaku', name: '雲鶴の間' },
  { id: 'hien', name: '飛燕の間' },
  { id: 'ginsa', name: '銀沙の間' },
  { id: 'katsura', name: '桂の間' },
  { id: 'koun', name: '香雲の間' },
  { id: 'hozuki', name: '歩月の間' },
] as const;

export type RoomId = typeof SHOGI_ROOMS[number]['id'];

export const INITIAL_TIME = 300; // 5分（秒）

export const ROOM_ERRORS = {
  ROOM_FULL: '対局室が満員です',
} as const; 