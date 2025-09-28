import { useRealtimeStore } from '../store/realtime-store';
import { useShamChessSocket } from './use-shamchess-socket';
import type { LobbySnapshot } from '../features/lobby/types';
import { createMockLobbySnapshot } from '../features/lobby/utils/mock-data';

export function useLobbySocket(): void {
  const setSnapshot = useRealtimeStore((state) => state.setLobbySnapshot);
  const setConnected = useRealtimeStore((state) => state.setLobbyConnected);

  useShamChessSocket<LobbySnapshot>({
    path: '/ws/lobby/',
    onMessage: (payload) => {
      setSnapshot(payload);
    },
    onOpen: () => setConnected(true),
    onClose: () => setConnected(false),
    mockGenerator: (emit) => {
      let snapshot = createMockLobbySnapshot();
      emit(snapshot);
      const interval = window.setInterval(() => {
        snapshot = createMockLobbySnapshot(snapshot.players);
        emit(snapshot);
      }, 4000);

      return () => {
        window.clearInterval(interval);
      };
    }
  });
}
