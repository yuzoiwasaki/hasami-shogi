import { useState } from 'react';
import { useGameRoomContext } from '../contexts/GameRoomContext';

export const RoomManager = () => {
  const { createRoom, joinRoom, room, role } = useGameRoomContext();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    try {
      await createRoom();
      setError(null);
    } catch (err) {
      setError('ルームの作成に失敗しました');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) {
      setError('ルームIDを入力してください');
      return;
    }

    try {
      await joinRoom(joinRoomId.trim());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルームへの参加に失敗しました');
    }
  };

  const getStatusMessage = () => {
    if (!room) return null;
    
    switch (room.gameState.status) {
      case 'waiting':
        return '対戦相手の参加を待っています...';
      case 'playing':
        return 'ゲーム中';
      case 'finished':
        return 'ゲーム終了';
      default:
        return null;
    }
  };

  return (
    <div className="text-center mb-4 p-3 bg-white rounded-lg shadow-md">
      <div className="space-y-4">
        {!room && (
          <>
            <div>
              <button
                onClick={handleCreateRoom}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                オンライン対戦を開始
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="ルームIDを入力"
                className="border rounded px-3 py-2"
              />
              <button
                onClick={handleJoinRoom}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                参加
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {room && (
          <div className="space-y-2">
            <div className="font-bold text-lg">
              {role === 'host' ? '先手（ホスト）' : '後手（ゲスト）'}
            </div>
            <div className="text-sm text-gray-600">
              ルームID: {room.id}
            </div>
            <div className="text-sm text-gray-600">
              {getStatusMessage()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 