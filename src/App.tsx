import { useOnlineHasamiShogi } from './hooks/useOnlineHasamiShogi';
import { RoomManager } from './components/RoomManager';
import { GameRoomProvider } from './contexts/GameRoomContext';
import { useState, useEffect } from 'react';
import { SHOGI_ROOMS, RoomId } from './constants/rooms';
import { useGameRoomContext } from './contexts/GameRoomContext';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase/config';
import type { RoomStatus } from './types';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { WinnerModal } from './components/WinnerModal';

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

  if (!room) return null;

  const roomName = getRoomName() || '';
  const playerRole = getPlayerRole() || '先手';
  const timeDisplay = getTimeDisplay() || { firstPlayer: '00:00', secondPlayer: '00:00' };

  return (
    <div className="max-w-4xl mx-auto">
      <RoomManager />
      <div className="space-y-6">
        <GameHeader
          room={room}
          getRoomName={() => roomName}
          isMyTurn={isMyTurn}
          getPlayerRole={() => playerRole}
          resign={resign}
          currentPlayer={currentPlayer}
          getPlayerName={getPlayerName}
          getTimeDisplay={() => timeDisplay}
          gameState={room.gameState}
        />
        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 text-lg text-center flex items-center justify-center gap-2">
            <span className="animate-bounce">⚠️</span>
            <span>{error.message}</span>
          </div>
        )}
        {room.gameState.status === 'playing' && (
          <GameBoard
            board={board}
            selectedCell={selectedCell}
            handleCellClick={handleCellClick}
          />
        )}
      </div>
      {winner && (
        <WinnerModal
          winner={winner}
          getPlayerName={getPlayerName}
          countdown={countdown}
        />
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            はさみ将棋オンライン
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOGI_ROOMS.map((room) => {
            const status = roomStatuses[room.id];
            const playerCount = status?.players || 0;
            const isPlaying = status?.status === 'playing';
            return (
              <div
                key={room.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl bg-amber-100 p-3 rounded-full">
                    {room.icon}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {room.name}
                  </h2>
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isPlaying 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isPlaying ? '対局中' : '待機中'}
                    </span>
                    <span className="text-gray-600">
                      {playerCount}/2 プレイヤー
                    </span>
                  </div>
                  {(!status || status.status === 'waiting') && (
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      入室する
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
