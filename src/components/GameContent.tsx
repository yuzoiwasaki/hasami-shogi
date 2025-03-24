import { Cell } from './Cell';
import { useOnlineHasamiShogi } from '../hooks/useOnlineHasamiShogi';
import { RoomManager } from './RoomManager';

export function GameContent() {
  const {
    board,
    selectedCell,
    currentPlayer,
    error,
    handleCellClick,
    getPlayerName,
    room,
    getPlayerRole,
    getRoomName,
    leaveRoom,
    isMyTurn,
    getTimeDisplay,
    resign,
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
        {room && room.gameState.status === 'playing' && (
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

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
              ⚠️ {error.message}
            </div>
          )}
        </div>
      )}

      {room && room.gameState.status === 'playing' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="grid grid-cols-9 gap-1">
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
    </div>
  );
} 