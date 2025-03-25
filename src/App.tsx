import { Cell } from './components/Cell';
import { useOnlineHasamiShogi } from './hooks/useOnlineHasamiShogi';
import { RoomManager } from './components/RoomManager';
import { GameRoomProvider } from './contexts/GameRoomContext';
import { useState, useEffect } from 'react';
import { SHOGI_ROOMS, RoomId } from './constants/rooms';
import { useGameRoomContext } from './contexts/GameRoomContext';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase/config';
import type { RoomStatus } from './types';

function GameContent() {
  const {
    board,
    selectedCell,
    currentPlayer,
    winner,
    error,
    handleCellClick,
    getPlayerName,
    room,
    getPlayerRole,
    getRoomName,
    isMyTurn,
    getTimeDisplay,
    resign,
  } = useOnlineHasamiShogi();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (winner) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [winner]);

  return (
    <div className="max-w-4xl mx-auto">
      <RoomManager />
      
      {room && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div className="text-xl font-bold text-gray-700 flex items-center gap-3">
              <span className="text-2xl">{SHOGI_ROOMS.find(r => r.id === room.id)?.icon}</span>
              対局室: {getRoomName()}
            </div>
            {room.gameState.status === 'playing' && (
              <button
                onClick={() => {
                  if (window.confirm('投了しますか？')) {
                    resign();
                  }
                }}
                disabled={!isMyTurn}
                className={`px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 ${
                  isMyTurn
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={isMyTurn ? '投了する' : '相手の手番です'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                投了
              </button>
            )}
          </div>
          {room.gameState.status === 'playing' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    currentPlayer === '歩' ? 'bg-blue-500' : 'bg-red-500'
                  } mr-3`}></div>
                  <div className="text-lg">
                    現在の手番: <span className="font-bold">{getPlayerName(currentPlayer)}</span>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-lg ${
                  getPlayerRole() === '先手' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                } font-bold text-sm`}>
                  あなた: {getPlayerRole()}
                </div>
              </div>

              <div className="flex justify-between mb-6 px-6">
                <div className={`text-lg ${currentPlayer === '歩' ? 'font-bold' : ''}`}>
                  先手: {getTimeDisplay()?.firstPlayer}
                </div>
                <div className={`text-lg ${currentPlayer === 'と' ? 'font-bold' : ''}`}>
                  後手: {getTimeDisplay()?.secondPlayer}
                </div>
              </div>

              <div className={`text-center py-3 rounded-lg text-lg ${
                isMyTurn
                  ? 'bg-green-50 text-green-800 border-2 border-green-500'
                  : 'bg-gray-50 text-gray-600'
              }`}>
                {isMyTurn
                  ? '🎯 あなたの番です'
                  : '⏳ 相手の番です'}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-end mb-6">
                <div className={`px-4 py-1.5 rounded-lg ${
                  getPlayerRole() === '先手' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                } font-bold text-sm`}>
                  あなた: {getPlayerRole()}
                </div>
              </div>
              <div className="text-center py-4 bg-yellow-50 rounded-lg text-yellow-800 text-lg">
                対戦相手の入室を待っています...
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 text-lg text-center flex items-center justify-center gap-2">
              <span className="animate-bounce">⚠️</span>
              <span>{error.message}</span>
            </div>
          )}
        </div>
      )}

      {room && room.gameState.status === 'playing' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-9 gap-1.5">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  piece={cell}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  isSelected={
                    selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex
                  }
                />
              ))
            )}
          </div>
        </div>
      )}

      {winner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl p-12 transform scale-100 animate-bounce-once max-w-lg w-full mx-4">
            <div className="text-center">
              <div className="text-5xl mb-6">🎉</div>
              <div className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                {getPlayerName(winner)}の勝利！
              </div>
              <div className="text-gray-600 text-lg animate-pulse">
                {countdown}秒後に自動的に退出します...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomList() {
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const { enterRoom } = useGameRoomContext();
  const [roomStatuses, setRoomStatuses] = useState<Record<RoomId, RoomStatus>>({} as Record<RoomId, RoomStatus>);

  useEffect(() => {
    const roomRefs = SHOGI_ROOMS.map(room => ref(db, `rooms/${room.id}`));
    const unsubscribes = roomRefs.map((roomRef, index) => 
      onValue(roomRef, (snapshot) => {
        const roomData = snapshot.val();
        setRoomStatuses(prev => {
          const newStatuses = { ...prev };
          if (roomData) {
            let playerCount = 0;
            if (roomData.firstPlayerId) playerCount++;
            if (roomData.secondPlayerId) playerCount++;
            
            newStatuses[SHOGI_ROOMS[index].id] = {
              status: roomData.gameState.status,
              players: playerCount
            };
          } else {
            delete newStatuses[SHOGI_ROOMS[index].id];
          }
          return newStatuses;
        });
      })
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const handleJoinRoom = async (roomId: RoomId) => {
    try {
      await enterRoom(roomId);
      setRoomId(roomId);
    } catch (error) {
      console.error('入室に失敗しました:', error);
    }
  };

  if (roomId) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <GameContent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 text-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 font-japanese border-b-2 border-gray-800 pb-4">
          はさみ将棋オンライン
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHOGI_ROOMS.map((room) => {
            const status = roomStatuses[room.id];
            const playerCount = status?.players || 0;
            const isPlaying = status?.status === 'playing';
            return (
              <div
                key={room.id}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {room.icon}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-800 font-japanese">
                    {room.name}
                  </h2>
                </div>
                <div className="flex justify-between items-center border-t pt-4 mt-4">
                  <span className="text-gray-600 mr-4">
                    {isPlaying ? '対局中' : `${playerCount}/2 プレイヤー`}
                  </span>
                  {(!status || status.status === 'waiting') && (
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded transition-colors duration-300 font-japanese"
                    >
                      入室
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <GameRoomProvider>
      <RoomList />
    </GameRoomProvider>
  );
}

export default App;
