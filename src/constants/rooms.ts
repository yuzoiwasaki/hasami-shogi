export const SHOGI_ROOMS = [
  { 
    id: 'special',
    name: '特別対局室',
    icon: '👑'
  },
  { 
    id: 'takao',
    name: '高雄の間',
    icon: '⛰️'
  },
  { 
    id: 'kiho',
    name: '棋峰の間',
    icon: '♟️'
  },
  { 
    id: 'unkaku',
    name: '雲鶴の間',
    icon: '🏔️'
  },
  { 
    id: 'hien',
    name: '飛燕の間',
    icon: '🕊️'
  },
  { 
    id: 'ginsa',
    name: '銀沙の間',
    icon: '🌊'
  },
  { 
    id: 'katsura',
    name: '桂の間',
    icon: '🌳'
  },
  { 
    id: 'koun',
    name: '香雲の間',
    icon: '☁️'
  },
  { 
    id: 'hozuki',
    name: '歩月の間',
    icon: '🌕'
  },
] as const;

export type RoomId = typeof SHOGI_ROOMS[number]['id'];

export const INITIAL_TIME = 300; // 5分（秒）

export const ROOM_ERRORS = {
  ROOM_FULL: '対局室が満員です',
} as const; 