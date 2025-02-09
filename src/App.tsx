import { Cell } from './components/Cell';
import { useHasamiShogi } from './hooks/useHasamiShogi';

function App() {
  const {
    board,
    selectedCell,
    currentPlayer,
    winner,
    handleCellClick,
    resetGame,
    getPlayerName,
  } = useHasamiShogi();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 font-japanese">
          はさみ将棋
        </h1>
        
        <div className="text-center mb-8 p-4 bg-white rounded-lg shadow-md">
          {winner ? (
            <div className="space-y-4">
              <div className="text-2xl font-bold text-gray-800">
                {getPlayerName(winner)}（{winner}）の勝利！
              </div>
              <button
                onClick={resetGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg
                  transition duration-200 ease-in-out transform hover:scale-105 shadow-lg"
              >
                もう一度プレイ
              </button>
            </div>
          ) : (
            <div className="text-xl text-gray-700">
              現在の手番: <span className="font-bold">{getPlayerName(currentPlayer)}（{currentPlayer}）</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-9 gap-px bg-gray-200">
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
    </div>
  );
}

export default App;
