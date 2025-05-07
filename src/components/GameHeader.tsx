import { SHOGI_ROOMS } from '../constants/rooms';
import type { Room, PlayerRole, Player, TimeDisplay } from '../types';

interface GameHeaderProps {
  room: Room;
  getRoomName: () => string;
  isMyTurn: boolean;
  getPlayerRole: () => PlayerRole;
  resign: () => void;
  currentPlayer: Player;
  getPlayerName: (player: Player) => PlayerRole;
  getTimeDisplay: () => TimeDisplay | undefined;
  gameState: {
    status: 'waiting' | 'playing' | 'finished';
  };
}

export function GameHeader({
  room,
  getRoomName,
  isMyTurn,
  getPlayerRole,
  resign,
  currentPlayer,
  getPlayerName,
  getTimeDisplay,
  gameState,
}: GameHeaderProps) {
  if (gameState.status !== 'playing') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="text-xl font-bold text-gray-700 flex items-center gap-3">
            <span className="text-2xl">{SHOGI_ROOMS.find(r => r.id === room.id)?.icon}</span>
            対局室: {getRoomName()}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <div className={`px-4 py-1.5 rounded-lg ${
            getPlayerRole() === '先手' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
          } font-bold text-sm`}>
            あなた: {getPlayerRole()}
          </div>
        </div>
        <div className="text-center py-4 bg-yellow-50 rounded-lg text-yellow-800 text-lg mt-4">
          対戦相手の入室を待っています...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="text-xl font-bold text-gray-700 flex items-center gap-3">
          <span className="text-2xl">{SHOGI_ROOMS.find(r => r.id === room.id)?.icon}</span>
          対局室: {getRoomName()}
        </div>
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
      </div>

      <div className="flex items-center justify-between mt-6">
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

      <div className="flex justify-between mt-6 px-6">
        <div className={`text-lg ${currentPlayer === '歩' ? 'font-bold' : ''}`}>
          先手: {getTimeDisplay()?.firstPlayer}
        </div>
        <div className={`text-lg ${currentPlayer === 'と' ? 'font-bold' : ''}`}>
          後手: {getTimeDisplay()?.secondPlayer}
        </div>
      </div>

      <div className={`text-center py-3 rounded-lg text-lg mt-6 ${
        isMyTurn
          ? 'bg-green-50 text-green-800 border-2 border-green-500'
          : 'bg-gray-50 text-gray-600'
      }`}>
        {isMyTurn
          ? '🎯 あなたの番です'
          : '⏳ 相手の番です'}
      </div>
    </div>
  );
} 