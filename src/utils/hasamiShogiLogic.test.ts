import { describe, it, expect } from 'vitest';
import { createInitialBoard, isValidMove, hasObstacleInPath } from './hasamiShogiLogic';

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

  describe('移動のバリデーション', () => {
    it('直線移動が可能', () => {
      const board = createInitialBoard();
      
      // 縦移動（歩を一マス前に）
      expect(isValidMove(board, 8, 0, 7, 0)).toBe(true);
      // 横移動（隣に駒があるため不可）
      expect(isValidMove(board, 8, 0, 8, 1)).toBe(false);
    });

    it('斜め移動は不可', () => {
      const board = createInitialBoard();
      expect(isValidMove(board, 8, 0, 7, 1)).toBe(false);
    });

    it('駒を飛び越えられない', () => {
      const board = Array(9).fill(null).map(() => Array(9).fill(null));
      board[4][0] = '歩';  // 途中に駒を配置
      
      // 縦方向の確認
      expect(hasObstacleInPath(board, 8, 0, 0, 0)).toBe(true);  // 障害物があるのでtrue
      expect(hasObstacleInPath(board, 8, 0, 5, 0)).toBe(false); // 障害物がないのでfalse
    });
  });
}); 