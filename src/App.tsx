import { Cell } from './components/Cell';
import { useOnlineHasamiShogi } from './hooks/useOnlineHasamiShogi';
import { RoomManager } from './components/RoomManager';
import { GameRoomProvider } from './contexts/GameRoomContext';

function GameContent() {
  const {
    board,
    selectedCell,
    currentPlayer,
    winner,
    error,
    handleCellClick,
    resetGame,
    getPlayerName,
    room,
  } = useOnlineHasamiShogi();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 font-japanese">
          はさみ将棋
        </h1>
        {room && (
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg
              transition duration-200 ease-in-out transform hover:scale-105 shadow-lg text-sm ml-4"
          >
            ホームに戻る
          </button>
        )}
      </div>
      
      <RoomManager />
      
      <div className="text-center mb-6 sm:mb-10 p-4 sm:p-6 bg-white rounded-lg shadow-lg border border-gray-100">
        {winner ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 animate-fade-in">
              {getPlayerName(winner)}
              <span className="inline-block mx-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                {winner}
              </span>
              の勝利！
            </div>
            <button
              onClick={resetGame}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg
                transition duration-200 ease-in-out transform hover:scale-105 shadow-lg text-base sm:text-lg"
            >
              もう一度プレイ
            </button>
          </div>
        ) : (
          <div className="text-xl sm:text-2xl text-gray-700">
            現在の手番: 
            <span className={`font-bold ml-2 inline-block px-3 py-1 rounded-full ${
              currentPlayer === '歩' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
            }`}>
              {getPlayerName(currentPlayer)}
              <span className="mx-1">（{currentPlayer}）</span>
            </span>
          </div>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="text-center mb-6 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-sm">
          {error.message}
        </div>
      )}

      <div className="flex justify-center">
        <div className="bg-white p-3 sm:p-8 rounded-xl shadow-xl border border-gray-100">
          <div className="grid grid-cols-9 gap-0.5 sm:gap-1 bg-gray-200 p-0.5 sm:p-1 rounded-lg">
            {board.map((row, i) =>
              row.map((piece, j) => (
                <Cell
                  key={`${i}-${j}`}
                  piece={piece}
                  onClick={() => handleCellClick(i, j)}
                  isSelected={selectedCell ? selectedCell[0] === i && selectedCell[1] === j : false}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <GameRoomProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-8">
        <GameContent />
      </div>
    </GameRoomProvider>
  );
}

export default App;
