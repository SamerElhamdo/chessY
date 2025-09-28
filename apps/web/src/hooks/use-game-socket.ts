import { useRealtimeStore } from '../store/realtime-store';
import { useShamChessSocket } from './use-shamchess-socket';
import type { MoveRecord } from '../features/game/types';

interface GameSocketPayload {
  game_id: number;
  fen: string;
  moves: MoveRecord[];
  last_move?: { from: string; to: string };
}

const MOCK_MESSAGES: GameSocketPayload[] = [
  {
    game_id: 1,
    fen: 'r2qk2r/pp1b1ppp/2n1pn2/2bp4/2B5/2NP1N2/PPP2PPP/R1BQR1K1 w kq - 0 10',
    moves: [
      { move: '1', notation: 'd4' },
      { move: '2', notation: 'Nf3' },
      { move: '3', notation: 'Bg5' },
      { move: '4', notation: 'O-O' }
    ]
  },
  {
    game_id: 1,
    fen: 'r2qk2r/pp1b1ppp/2n1pn2/2bp4/2B5/2NP1N2/PPP2PPP/R1BQR1K1 b kq - 1 10',
    moves: [
      { move: '1', notation: 'd4' },
      { move: '2', notation: 'Nf3' },
      { move: '3', notation: 'Bg5' },
      { move: '4', notation: 'O-O' },
      { move: '5', notation: 'Qxd5' }
    ],
    last_move: { from: 'd4', to: 'd5' }
  }
];

export function useGameSocket(): void {
  const setGameState = useRealtimeStore((state) => state.setGameState);
  const patchGameState = useRealtimeStore((state) => state.patchGameState);

  useShamChessSocket<GameSocketPayload>({
    path: '/ws/games/1/',
    onMessage: (payload) => {
      setGameState({
        gameId: payload.game_id,
        fen: payload.fen,
        moves: payload.moves,
        lastMove: payload.last_move
      });
    },
    onClose: () => patchGameState({ lastMove: undefined }),
    mockGenerator: (emit) => {
      let index = 0;
      emit(MOCK_MESSAGES[index]);
      const interval = window.setInterval(() => {
        index = (index + 1) % MOCK_MESSAGES.length;
        emit(MOCK_MESSAGES[index]);
      }, 5000);
      return () => window.clearInterval(interval);
    }
  });
}
