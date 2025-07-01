import { useState, useEffect } from 'react';
import { SHOGI_ROOMS, RoomId } from '../constants/rooms';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import type { RoomStatus } from '../types';

/**
 * 部屋の状態を監視するカスタムフック
 * 各部屋のプレイヤー数とゲーム状態をリアルタイムで監視
 */
export function useRoomStatuses() {
  const [roomStatuses, setRoomStatuses] = useState<Record<RoomId, RoomStatus>>({});

  useEffect(() => {
    const roomRefs = SHOGI_ROOMS.map(room => ref(db, `rooms/${room.id}`));
    const unsubscribes = roomRefs.map((roomRef, index) => 
      onValue(roomRef, (snapshot) => {
        const roomData = snapshot.val();
        setRoomStatuses(prev => {
          const newStatuses = { ...prev };
          if (roomData) {
            let playerCount = 0;
            if (roomData.firstPlayerId) playerCount++;
            if (roomData.secondPlayerId) playerCount++;
            newStatuses[SHOGI_ROOMS[index].id] = {
              status: roomData.gameState.status,
              players: playerCount
            };
          } else {
            delete newStatuses[SHOGI_ROOMS[index].id];
          }
          return newStatuses;
        });
      })
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return roomStatuses;
} 