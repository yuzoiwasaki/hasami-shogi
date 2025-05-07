import { useEffect, useState } from 'react';
import type { Player, PlayerRole } from '../types';

interface WinnerModalProps {
  winner: Player;
  getPlayerName: (player: Player) => PlayerRole;
}

export function WinnerModal({
  winner,
  getPlayerName,
}: WinnerModalProps) {
  const [localCountdown, setLocalCountdown] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    timer = setInterval(() => {
      setLocalCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [winner]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl p-12 transform scale-100 animate-bounce-once max-w-lg w-full mx-4">
        <div className="text-center">
          <div className="text-5xl mb-6">🎉</div>
          <div className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {getPlayerName(winner)}の勝利！
          </div>
          <div className="text-gray-600 text-lg animate-pulse">
            {localCountdown}秒後に自動的に退出します...
          </div>
        </div>
      </div>
    </div>
  );
} 