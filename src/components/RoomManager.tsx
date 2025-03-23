import { useGameRoomContext } from '../contexts/GameRoomContext';

export function RoomManager() {
  const { room, leaveRoom } = useGameRoomContext();

  if (!room) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={leaveRoom}
        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg
          transition duration-200 ease-in-out transform hover:scale-105 shadow-sm"
      >
        対局室から退出する
      </button>
    </div>
  );
} 