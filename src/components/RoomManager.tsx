import { useState, useEffect } from 'react';
import { useGameRoomContext } from '../contexts/GameRoomContext';
import { SHOGI_ROOMS } from '../constants/rooms';
import type { GameRoom } from '../types';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';

export const RoomManager = () => {
  const { room, isFirstPlayer, enterRoom } = useGameRoomContext();
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [occupiedRooms, setOccupiedRooms] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkOccupiedRooms = async () => {
      try {
        const occupiedRoomIds: string[] = [];
        
        for (const room of SHOGI_ROOMS) {
          const roomRef = ref(db, `rooms/${room.id}`);
          const snapshot = await get(roomRef);
          const roomData = snapshot.val() as GameRoom | null;
          
          if (roomData?.gameState.status === 'playing') {
            occupiedRoomIds.push(room.id);
          }
        }
        
        setOccupiedRooms(occupiedRoomIds);
      } catch (err) {
        console.error('部屋の状態チェックに失敗しました:', err);
      }
    };

    const interval = setInterval(checkOccupiedRooms, 5000);
    checkOccupiedRooms();

    return () => clearInterval(interval);
  }, []);

  const handleEnterRoom = async () => {
    if (!selectedRoomId) {
      setError('対局室を選択してください');
      return;
    }

    try {
      setError(null);
      await enterRoom(selectedRoomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    }
  };

  if (room && isFirstPlayer !== null) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <select
        value={selectedRoomId}
        onChange={(e) => setSelectedRoomId(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">対局室を選択</option>
        {SHOGI_ROOMS.map(({ id, name }) => (
          <option
            key={id}
            value={id}
            disabled={occupiedRooms.includes(id)}
          >
            {name} {occupiedRooms.includes(id) ? '(使用中)' : ''}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500">{error}</p>
      )}
      <button
        onClick={handleEnterRoom}
        disabled={!selectedRoomId}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        対局室に入る
      </button>
    </div>
  );
}; 