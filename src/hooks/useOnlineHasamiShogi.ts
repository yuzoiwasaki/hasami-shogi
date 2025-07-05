import { useGameRoomContext } from '../contexts/GameRoomContext';
import { useEffect, useState, useCallback } from 'react';
import { Board, Player, Position, GameErrorCode } from '../types';
import {
  createInitialBoard,
  checkCaptures,
  isValidMove,
  checkWinner,
  createGameError,
} from '../utils/hasamiShogiLogic';
import { SHOGI_ROOMS, DEFAULT_TIME } from '../constants/rooms';
import { ref, update, set } from 'firebase/database';
import { db } from '../firebase/config';
import { useGameTimer } from './useGameTimer';

export const useOnlineHasamiShogi = () => {
  const {
    room,
    isFirstPlayer,
    leaveRoom,
  } = useGameRoomContext();

  // 盤面データを配列に変換する関数
  const convertToBoard = (data: Board | null | undefined): Board => {
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
      console.error('Error converting board:', error);
      return createInitialBoard();
    }

    return board;
  };

  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('歩');
  const [error, setError] = useState<{ message: string } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState<number>(10);

  // 時間管理フックを使用
  const {
    getTimeDisplay,
    isTimeUp,
    calculatePlayerTimes,
  } = useGameTimer({ room });

  const updateGameState = useCallback(async (updates: Record<string, unknown>) => {
    if (!room) return;
    await update(ref(db, `rooms/${room.id}/gameState`), updates);
  }, [room?.id]);

  const resetGameState = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer('歩');
    setSelectedCell(null);
    setWinner(null);
    setError(null);
  }, []);

  // roomの状態が変更されたら同期
  useEffect(() => {
    if (room) {
      // 入室直後の場合は盤面をリセット
      if (room.gameState.status === 'waiting') {
        const initialBoard = createInitialBoard();
        // 直接Firebaseを更新
        update(ref(db, `rooms/${room.id}/gameState`), {
          board: initialBoard,
          currentTurn: '歩',
          status: 'waiting',
          isFirstPlayerTurn: true,
        });
        resetGameState();
        return;
      }

      // ゲームが実際に開始された時（二人目のプレイヤーが入室した時）
      if (room.gameState.status === 'playing' && 
          room.gameState.firstPlayerId && 
          room.gameState.secondPlayerId && 
          !room.gameState.lastMoveTime) {
        // 部屋の設定から初期時間を取得
        const roomConfig = SHOGI_ROOMS.find((r) => r.id === room.id);
        const initialTime = roomConfig?.initialTime ?? DEFAULT_TIME;
        
        // lastMoveTimeを設定してゲーム開始
        update(ref(db, `rooms/${room.id}/gameState`), {
          lastMoveTime: Date.now(),
          firstPlayerTime: initialTime,
          secondPlayerTime: initialTime,
        });
        return;
      }

      const newBoard = convertToBoard(room.gameState.board);
      setBoard(newBoard);
      setCurrentPlayer(room.gameState.currentTurn);
    }
  }, [room?.gameState.board, room?.gameState.currentTurn, room?.gameState.status, 
      room?.gameState.firstPlayerId, room?.gameState.secondPlayerId, room?.gameState.lastMoveTime]);

  const isMyTurn = room ? (
    (isFirstPlayer && currentPlayer === '歩') || (!isFirstPlayer && currentPlayer === 'と')
  ) : true;

  const getPlayerName = (piece: Player) => {
    return piece === '歩' ? '先手' : '後手';
  };

  const handleGameEnd = useCallback((winner: '歩' | 'と') => {
    setWinner(winner);
    setError(null);
    setCountdown(10);

    // 10秒間のカウントダウン
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setWinner(null);
          leaveRoom();
          // トップページに戻るために、window.locationを更新
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // クリーンアップ関数を返す
    return () => clearInterval(countdownTimer);
  }, [leaveRoom]);

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (!room || isFirstPlayer === null) return;
    
    if (!isMyTurn) {
      setError(createGameError(GameErrorCode.NOT_YOUR_TURN));
      return;
    }

    try {
      const newBoard = [...board];
      const currentTurn = currentPlayer;

      if (selectedCell) {
        // 同じ位置をクリックした場合は選択をキャンセル
        if (selectedCell[0] === row && selectedCell[1] === col) {
          setSelectedCell(null);
          setError(null);
          return;
        }

        // 駒を移動
        const [fromRow, fromCol] = selectedCell;
        
        // 移動のバリデーション
        if (!isValidMove(board, fromRow, fromCol, row, col)) {
          setError(createGameError(GameErrorCode.INVALID_MOVE));
          setSelectedCell(null);
          return;
        }

        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;

        // 駒を取る
        const capturedPieces = checkCaptures(newBoard, row, col, currentTurn);
        capturedPieces.forEach(([r, c]) => {
          newBoard[r][c] = null;
        });

        // 勝者判定
        const winner = checkWinner(newBoard);

        // 経過時間を計算して現在の手番のプレイヤーの時間を更新
        const currentTime = Date.now();
        const { firstPlayerTime: updatedFirstPlayerTime, secondPlayerTime: updatedSecondPlayerTime } = calculatePlayerTimes(currentTurn);

        // Firebaseのデータベースを直接更新
        await updateGameState({
          board: newBoard,
          currentTurn: currentTurn === '歩' ? 'と' : '歩',
          firstPlayerTime: updatedFirstPlayerTime,
          secondPlayerTime: updatedSecondPlayerTime,
          lastMoveTime: currentTime,
          ...(winner ? { status: 'finished', winner } : { status: 'playing' })
        });

        if (winner) {
          handleGameEnd(winner);
        }

        setSelectedCell(null);
        setError(null);
      } else {
        // 駒を選択
        if (newBoard[row][col] === currentTurn) {
          setSelectedCell([row, col]);
          setError(null);
        } else if (newBoard[row][col] !== null) {
          setError(createGameError(GameErrorCode.WRONG_PIECE));
        }
      }
    } catch (error) {
      console.error('Error handling cell click:', error);
      setError(createGameError(GameErrorCode.INVALID_MOVE));
    }
  }, [room, board, currentPlayer, selectedCell, isMyTurn, handleGameEnd, isFirstPlayer]);



  // 勝利判定（入室直後はスキップ）
  useEffect(() => {
    if (!room || room.gameState.status === 'waiting' || winner) return;

    // Firebaseからの勝利状態の監視
    if (room.gameState.status === 'finished' && room.gameState.winner) {
      handleGameEnd(room.gameState.winner);
    }
  }, [handleGameEnd, room?.gameState.status, room?.gameState.winner, winner]);

  // 時間切れの判定
  useEffect(() => {
    if (!room || room.gameState.status !== 'playing') return;

    if (isTimeUp()) {
      const winner = room.gameState.currentTurn === '歩' ? 'と' : '歩';
      handleGameEnd(winner);
      setError(createGameError(GameErrorCode.TIME_UP));

      // 時間切れの場合も部屋を削除
      setTimeout(async () => {
        const roomRef = ref(db, `rooms/${room.id}`);
        await set(roomRef, null);
      }, 10000);
    }
  }, [room, isTimeUp, handleGameEnd]);

  const getPlayerRole = () => {
    if (isFirstPlayer === null || !room) return null;
    return isFirstPlayer ? '先手' : '後手';
  };

  const getGameStatus = () => {
    if (!room) return null;
    if (winner) return `${getPlayerName(winner)}の勝利です！`;
    if (room.gameState.status === 'waiting') return '対戦相手の入室を待っています...';
    return `${getPlayerName(currentPlayer)}の手番です${isMyTurn ? '（あなたの番です）' : ''}`;
  };

  const getRoomName = () => {
    if (!room) return null;
    const roomInfo = SHOGI_ROOMS.find(r => r.id === room.id);
    return roomInfo?.name ?? room.id;
  };

  const resign = async () => {
    if (!room || room.gameState.status !== 'playing' || isFirstPlayer === null || !isMyTurn) return;
    const winner: Player = isFirstPlayer ? 'と' : '歩';
    
    // 投了時の状態を更新（Firebaseのデータベースを直接更新）
    await updateGameState({
      board,
      currentTurn: winner,
      status: 'finished',
      winner,
    });

    handleGameEnd(winner);
  };

  return {
    board,
    selectedCell,
    currentPlayer,
    winner,
    error,
    handleCellClick,
    getPlayerName,
    room,
    getPlayerRole,
    getGameStatus,
    getRoomName,
    leaveRoom,
    isMyTurn,
    getTimeDisplay,
    resign,
    handleGameEnd,
    countdown,
  };
}; 