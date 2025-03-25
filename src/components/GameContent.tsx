import { useOnlineHasamiShogi } from '../hooks/useOnlineHasamiShogi';
import { RoomManager } from './RoomManager';

export function GameContent() {
  const {
    currentPlayer,
    getPlayerName,
    room,
    getPlayerRole,
    getRoomName,
    leaveRoom,
    isMyTurn,
    getTimeDisplay,
  } = useOnlineHasamiShogi();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 font-japanese">
          はさみ将棋
        </h1>
        {room && room.gameState.status === 'waiting' && (
          <button
            onClick={leaveRoom}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg
              transition duration-200 ease-in-out transform hover:scale-105 shadow-sm text-sm flex items-center gap-1"
            title="対局から退出します"
          >
            退出
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
      
      <RoomManager />
      
      {room && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div className="text-lg font-bold text-gray-700">
              対局室: {getRoomName()}
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${
                currentPlayer === '歩' ? 'bg-blue-500' : 'bg-red-500'
              } mr-2`}></div>
              <div className="text-lg">
                現在の手番: <span className="font-bold">{getPlayerName(currentPlayer)}</span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              getPlayerRole() === '先手' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
            } font-bold`}>
              あなた: {getPlayerRole()}
            </div>
          </div>

          <div className="flex justify-between mb-4 px-4">
            <div className={`text-lg ${currentPlayer === '歩' ? 'font-bold' : ''}`}>
              先手: {getTimeDisplay()?.firstPlayer}
            </div>
            <div className={`text-lg ${currentPlayer === 'と' ? 'font-bold' : ''}`}>
              後手: {getTimeDisplay()?.secondPlayer}
            </div>
          </div>

          {room.gameState.status === 'waiting' ? (
            <div className="text-center py-4 bg-yellow-50 rounded-lg text-yellow-800">
              対戦相手の入室を待っています...
            </div>
          ) : (
            <div className={`text-center py-2 rounded-lg ${
              isMyTurn
                ? 'bg-green-50 text-green-800 border-2 border-green-500'
                : 'bg-gray-50 text-gray-600'
            }`}>
              {isMyTurn
                ? '🎯 あなたの番です'
                : '⏳ 相手の番です'}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 