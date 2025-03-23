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
import { SHOGI_ROOMS } from '../constants/rooms';
import { INITIAL_TIME } from '../hooks/useGameRoom';
import { ref, update } from 'firebase/database';
import { db } from '../firebase/config';

export const useOnlineHasamiShogi = () => {
  const {
    room,
    isFirstPlayer,
    updateGameState,
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
  const [localFirstPlayerTime, setLocalFirstPlayerTime] = useState<number>(INITIAL_TIME);
  const [localSecondPlayerTime, setLocalSecondPlayerTime] = useState<number>(INITIAL_TIME);

  // roomの状態が変更されたら同期
  useEffect(() => {
    if (room) {
      // 入室直後の場合は盤面をリセット
      if (room.gameState.status === 'waiting') {
        const initialBoard = createInitialBoard();
        updateGameState(initialBoard, '歩', true); // 先手の手番をtrueに設定
        setBoard(initialBoard);
        setCurrentPlayer('歩');
        setSelectedCell(null);
        setWinner(null);
        setError(null);
        return;
      }

      const newBoard = convertToBoard(room.gameState.board);
      setBoard(newBoard);
      setCurrentPlayer(room.gameState.currentTurn);
    }
  }, [room?.gameState.board, room?.gameState.currentTurn, room?.gameState.status]);

  const isMyTurn = room ? (
    (isFirstPlayer && currentPlayer === '歩') || (!isFirstPlayer && currentPlayer === 'と')
  ) : true;

  const getPlayerName = (piece: Player) => {
    return piece === '歩' ? '先手' : '後手';
  };

  const handleGameEnd = useCallback((winner: '歩' | 'と') => {
    setWinner(winner);
    setError(null);

    // 10秒後に自動退出
    const timer = setTimeout(() => {
      setWinner(null);
      leaveRoom();
      // トップページに戻るために、window.locationを更新
      window.location.reload();
    }, 10000);

    // クリーンアップ関数を返す
    return () => clearTimeout(timer);
  }, [leaveRoom]);

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (!room || !isMyTurn || isFirstPlayer === null) return;

    try {
      const newBoard = [...board];
      const currentTurn = currentPlayer;

      if (selectedCell) {
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
        const firstPlayerCount = newBoard.flat().filter(cell => cell === '歩').length;
        const secondPlayerCount = newBoard.flat().filter(cell => cell === 'と').length;

        // 経過時間を計算して現在の手番のプレイヤーの時間を更新
        const currentTime = Date.now();
        const timeElapsed = Math.floor((currentTime - room.gameState.lastMoveTime) / 1000);
        const updatedFirstPlayerTime = currentTurn === '歩' 
          ? Math.max(0, room.gameState.firstPlayerTime - timeElapsed)
          : room.gameState.firstPlayerTime;
        const updatedSecondPlayerTime = currentTurn === 'と'
          ? Math.max(0, room.gameState.secondPlayerTime - timeElapsed)
          : room.gameState.secondPlayerTime;

        // Firebaseのデータベースを直接更新
        await update(ref(db, `rooms/${room.id}/gameState`), {
          board: newBoard,
          currentTurn: currentTurn === '歩' ? 'と' : '歩',
          firstPlayerTime: updatedFirstPlayerTime,
          secondPlayerTime: updatedSecondPlayerTime,
          lastMoveTime: currentTime,
          ...(firstPlayerCount === 0 ? { status: 'finished', winner: 'と' } :
              secondPlayerCount === 0 ? { status: 'finished', winner: '歩' } :
              { status: 'playing' })
        });

        if (firstPlayerCount === 0) {
          handleGameEnd('と');
        } else if (secondPlayerCount === 0) {
          handleGameEnd('歩');
        }

        setSelectedCell(null);
        setError(null);
      } else {
        // 駒を選択
        if (newBoard[row][col] === currentTurn) {
          setSelectedCell([row, col]);
          setError(null);
        }
      }
    } catch (error) {
      console.error('Error handling cell click:', error);
      setError(createGameError(GameErrorCode.INVALID_MOVE));
    }
  }, [room, board, currentPlayer, selectedCell, isMyTurn, handleGameEnd, isFirstPlayer]);

  // サーバーの時間を基にローカルの時間を更新
  useEffect(() => {
    if (!room) return;
    const currentTime = Date.now();
    const timeElapsed = Math.floor((currentTime - room.gameState.lastMoveTime) / 1000);
    
    // 現在の手番のプレイヤーの時間のみ経過時間を引く
    const firstPlayerTime = room.gameState.currentTurn === '歩'
      ? Math.max(0, room.gameState.firstPlayerTime - timeElapsed)
      : room.gameState.firstPlayerTime;
    const secondPlayerTime = room.gameState.currentTurn === 'と'
      ? Math.max(0, room.gameState.secondPlayerTime - timeElapsed)
      : room.gameState.secondPlayerTime;

    setLocalFirstPlayerTime(firstPlayerTime);
    setLocalSecondPlayerTime(secondPlayerTime);
  }, [room?.gameState.firstPlayerTime, room?.gameState.secondPlayerTime, room?.gameState.lastMoveTime, room?.gameState.currentTurn]);

  // リアルタイムでの時間更新（より頻繁に更新）
  useEffect(() => {
    if (!room || room.gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      const currentTime = Date.now();
      const timeElapsed = Math.floor((currentTime - room.gameState.lastMoveTime) / 1000);
      
      // サーバーの時間を基準に計算
      const firstPlayerTime = room.gameState.currentTurn === '歩'
        ? Math.max(0, room.gameState.firstPlayerTime - timeElapsed)
        : room.gameState.firstPlayerTime;
      const secondPlayerTime = room.gameState.currentTurn === 'と'
        ? Math.max(0, room.gameState.secondPlayerTime - timeElapsed)
        : room.gameState.secondPlayerTime;

      setLocalFirstPlayerTime(firstPlayerTime);
      setLocalSecondPlayerTime(secondPlayerTime);
    }, 100); // より頻繁に更新（100ミリ秒ごと）

    return () => clearInterval(timer);
  }, [room?.gameState.status, room?.gameState.currentTurn, room?.gameState.lastMoveTime, room?.gameState.firstPlayerTime, room?.gameState.secondPlayerTime]);

  const getTimeDisplay = useCallback(() => {
    if (!room) return null;
    return {
      firstPlayer: formatTime(localFirstPlayerTime),
      secondPlayer: formatTime(localSecondPlayerTime),
    };
  }, [room, localFirstPlayerTime, localSecondPlayerTime]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 勝利判定（入室直後はスキップ）
  useEffect(() => {
    if (!room || room.gameState.status === 'waiting' || winner) return;

    // 通常の勝利判定
    const currentWinner = checkWinner(board, currentPlayer);
    if (currentWinner) {
      handleGameEnd(currentWinner);
    }

    // Firebaseからの勝利状態の監視
    if (room.gameState.status === 'finished' && room.gameState.winner) {
      handleGameEnd(room.gameState.winner);
    }
  }, [board, currentPlayer, handleGameEnd, room?.gameState.status, room?.gameState.winner, winner]);

  // 時間切れの判定
  useEffect(() => {
    if (!room || room.gameState.status !== 'playing') return;

    // 現在の手番のプレイヤーの時間が切れているかチェック
    const currentPlayerTime = room.gameState.currentTurn === '歩'
      ? localFirstPlayerTime
      : localSecondPlayerTime;

    if (currentPlayerTime <= 0) {
      const winner = room.gameState.currentTurn === '歩' ? 'と' : '歩';
      handleGameEnd(winner);
      setError(createGameError(GameErrorCode.TIME_UP));
    }
  }, [room, localFirstPlayerTime, localSecondPlayerTime, handleGameEnd]);

  const resetGame = async () => {
    const initialBoard = createInitialBoard();
    if (room) {
      // Firebaseに初期状態を送信
      await updateGameState(initialBoard, '歩', true);
    }
    setBoard(initialBoard);
    setCurrentPlayer('歩');
    setSelectedCell(null);
    setWinner(null);
    setError(null);
  };

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
    await update(ref(db, `rooms/${room.id}/gameState`), {
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
    resetGame,
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
  };
}; 