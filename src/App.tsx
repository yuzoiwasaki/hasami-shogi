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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">はさみ将棋</h1>
      <div className="text-center mb-4">
        {winner ? (
          <div>
            <div className="text-xl font-bold mb-2">
              {getPlayerName(winner)}（{winner}）の勝利！
            </div>
            <button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              もう一度プレイ
            </button>
          </div>
        ) : (
          <div>現在の手番: {getPlayerName(currentPlayer)}（{currentPlayer}）</div>
        )}
      </div>
      <div className="max-w-fit mx-auto">
        <div className="grid grid-cols-9 gap-0">
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
  );
}

export default App;
