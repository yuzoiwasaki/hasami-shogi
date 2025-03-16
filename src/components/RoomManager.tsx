import { useState } from 'react';
import { useGameRoom } from '../hooks/useGameRoom';

export const RoomManager = () => {
  const { createRoom, joinRoom } = useGameRoom();
  const [roomInfo, setRoomInfo] = useState<{ roomId: string; playerId: string } | null>(null);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    try {
      const info = await createRoom();
      setRoomInfo(info);
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
      const info = await joinRoom(joinRoomId.trim());
      setRoomInfo(info);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルームへの参加に失敗しました');
    }
  };

  return (
    <div className="text-center mb-4 p-3 bg-white rounded-lg shadow-md">
      <div className="space-y-4">
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

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {roomInfo && (
          <div className="mt-3 text-sm">
            <p>ルームID: {roomInfo.roomId}</p>
            <p>プレイヤーID: {roomInfo.playerId}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 