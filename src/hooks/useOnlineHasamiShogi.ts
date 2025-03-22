import { useGameRoomContext } from '../contexts/GameRoomContext';
import { useEffect, useState } from 'react';
import { Board, Player, Position } from '../types';

export const useOnlineHasamiShogi = () => {
  const { room, role, updateGameState } = useGameRoomContext();

  // 初期盤面を作成する関数
  const createInitialBoard = (): Board => {
    return Array(9).fill(null).map((_, row) => {
      if (row === 0) return Array(9).fill('と');
      if (row === 8) return Array(9).fill('歩');
      return Array(9).fill(null);
    });
  };

  // 盤面データを配列に変換する関数
  const convertToBoard = (data: any): Board => {
    if (!data) return createInitialBoard();

    // 空の9x9盤面を作成
    const board = Array(9).fill(null).map(() => Array(9).fill(null));

    try {
      // データを処理
      for (let i = 0; i < 9; i++) {
        const rowData = data[i];
        
        // 行が配列の場合
        if (Array.isArray(rowData)) {
          for (let j = 0; j < 9; j++) {
            board[i][j] = rowData[j] ?? null;
          }
          continue;
        }
        
        // 行がオブジェクトの場合
        if (rowData && typeof rowData === 'object') {
          // まず行を全てnullで初期化
          board[i] = Array(9).fill(null);
          // 存在する値のみを設定
          Object.entries(rowData).forEach(([j, value]) => {
            if (value !== undefined && value !== null) {
              board[i][Number(j)] = value;
            }
          });
        }
      }

    } catch (error) {
      return createInitialBoard();
    }

    return board;
  };

  // 盤面データを正規化する関数（nullをnullのまま、undefinedをnullに変換）
  const normalizeBoard = (board: Board): Board => {
    return board.map(row => 
      row.map(cell => cell === undefined ? null : cell)
    );
  };

  // 盤面データをFirebase用のオブジェクトに変換
  const boardToObject = (board: Board) => {
    try {
      const obj: { [key: number]: { [key: number]: string | null } } = {};
      
      for (let i = 0; i < 9; i++) {
        const rowObj: { [key: number]: string | null } = {};
        let hasNonNull = false;
        
        for (let j = 0; j < 9; j++) {
          const cell = board[i][j];
          if (cell !== null) {
            rowObj[j] = cell;
            hasNonNull = true;
          }
        }
        
        if (hasNonNull) {
          obj[i] = rowObj;
        }
      }
      
      return obj;
    } catch (error) {
      console.error('Error converting to object:', error);
      return {};
    }
  };

  const objectToBoard = (obj: { [key: number]: { [key: number]: string | null } }): Board => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        board[i][j] = obj[i]?.[j] ?? null;
      }
    }
    return board;
  };

  // 状態を直接管理
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('歩');
  const [error, setError] = useState<{ message: string } | null>(null);

  // roomの状態が変更されたら同期
  useEffect(() => {
    if (room) {
      const newBoard = convertToBoard(room.gameState.board);
      setBoard(newBoard);
      setCurrentPlayer(room.gameState.currentTurn);
    }
  }, [room?.gameState.board, room?.gameState.currentTurn, role]);

  // 初期状態の設定
  useEffect(() => {
    if (role === 'guest') {
      setCurrentPlayer('と');
    } else if (role === 'host') {
      setCurrentPlayer('歩');
    }
  }, [role]);

  // 自分の手番かどうかをチェック
  const isMyTurn = role !== null && (
    (role === 'host' && currentPlayer === '歩') || 
    (role === 'guest' && currentPlayer === 'と')
  );

  const handleCellClick = async (row: number, col: number) => {
    try {
      // オンライン対戦時の手番チェック
      if (room && !isMyTurn) {
        setError({ message: '自分の手番ではありません' });
        return;
      }

      if (!selectedCell) {
        // 駒の選択
        const clickedPiece = board[row][col];
        if (clickedPiece === currentPlayer) {
          setSelectedCell([row, col]);
          setError(null);
        }
      } else {
        const [selectedRow, selectedCol] = selectedCell;

        if (selectedRow === row && selectedCol === col) {
          // 選択解除
          setSelectedCell(null);
        } else {
          // 駒の移動を試みる
          const newBoard = board.map(row => [...row]);
          const movingPiece = board[selectedRow][selectedCol];
          newBoard[row][col] = movingPiece;
          newBoard[selectedRow][selectedCol] = null;

          // 次の手番を計算
          const nextTurn: Player = currentPlayer === '歩' ? 'と' : '歩';

          if (room) {
            // 盤面データを正規化してオブジェクトに変換
            const normalizedBoard = normalizeBoard(newBoard);
            const boardObj = boardToObject(normalizedBoard);
            
            // Firebaseに送信
            await updateGameState(objectToBoard(boardObj), nextTurn);
            
            // ローカルの状態を更新
            setBoard(normalizedBoard);
            setCurrentPlayer(nextTurn);
          } else {
            // ローカルの状態を更新
            setBoard(newBoard);
            setCurrentPlayer(nextTurn);
          }
          
          setSelectedCell(null);
        }
      }
    } catch (error) {
      console.error('Failed to update game state:', error);
      setError({ message: '移動に失敗しました' });
    }
  };

  const getPlayerName = (piece: Player) => {
    return piece === '歩' ? '先手' : '後手';
  };

  return {
    board,
    selectedCell,
    currentPlayer,
    winner: null,
    error,
    handleCellClick,
    resetGame: () => {},
    getPlayerName,
    room,
  };
}; 