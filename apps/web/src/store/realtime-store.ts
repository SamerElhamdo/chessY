import { create } from 'zustand';
import type { LobbySnapshot } from '../features/lobby/types';
import type { MoveRecord } from '../features/game/types';

export interface GameRealtimeState {
  gameId: number;
  fen: string;
  moves: MoveRecord[];
  lastMove?: { from: string; to: string };
}

interface RealtimeState {
  lobbySnapshot: LobbySnapshot | null;
  lobbyConnected: boolean;
  gameState: GameRealtimeState | null;
  setLobbySnapshot: (snapshot: LobbySnapshot | null) => void;
  setLobbyConnected: (status: boolean) => void;
  setGameState: (state: GameRealtimeState | null) => void;
  patchGameState: (patch: Partial<GameRealtimeState>) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  lobbySnapshot: null,
  lobbyConnected: false,
  gameState: null,
  setLobbySnapshot: (snapshot) => set({ lobbySnapshot: snapshot }),
  setLobbyConnected: (status) => set({ lobbyConnected: status }),
  setGameState: (state) => set({ gameState: state }),
  patchGameState: (patch) =>
    set((state) =>
      state.gameState
        ? {
            gameState: {
              ...state.gameState,
              ...patch,
              moves: patch.moves ?? state.gameState.moves
            }
          }
        : state
    )
}));
