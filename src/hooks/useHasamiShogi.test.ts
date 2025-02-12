import { describe, it, expect } from 'vitest';
import { createInitialBoard } from './useHasamiShogi.logic';

describe('はさみ将棋のロジック', () => {
  describe('初期盤面', () => {
    it('正しい初期配置になっている', () => {
      const board = createInitialBoard();
      
      // 最上段は「と」
      expect(board[0]).toEqual(Array(9).fill('と'));
      // 最下段は「歩」
      expect(board[8]).toEqual(Array(9).fill('歩'));
      // 中間は空
      for (let i = 1; i < 8; i++) {
        expect(board[i]).toEqual(Array(9).fill(null));
      }
    });
  });
}); 