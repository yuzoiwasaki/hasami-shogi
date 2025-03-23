import { useGameRoomContext } from '../contexts/GameRoomContext';

export function RoomManager() {
  const { room, leaveRoom } = useGameRoomContext();

  if (!room || room.gameState.status === 'playing') {
    return null;
  }

  const handleLeave = async () => {
    await leaveRoom();
    window.location.reload();
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleLeave}
        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg
          transition duration-200 ease-in-out transform hover:scale-105 shadow-sm"
      >
        対局室から退出する
      </button>
    </div>
  );
} 