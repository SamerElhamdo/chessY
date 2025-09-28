import { LobbyHero } from '../features/lobby/components/lobby-hero';
import { LobbyTable } from '../features/lobby/components/lobby-table';
import { MatchmakingPanel } from '../features/lobby/components/matchmaking-panel';
import { useLobbySocket } from '../hooks/use-lobby-socket';
import { useRealtimeStore } from '../store/realtime-store';

export function LobbyPage(): JSX.Element {
  useLobbySocket();
  const snapshot = useRealtimeStore((state) => state.lobbySnapshot);
  const connected = useRealtimeStore((state) => state.lobbyConnected);

  if (!snapshot) {
    return (
      <div className="grid gap-6">
        <div className="h-32 animate-pulse rounded-3xl bg-slate-800/40" />
        <div className="h-80 animate-pulse rounded-3xl bg-slate-800/40" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-800/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${connected ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'}`}>
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          {connected ? 'متصل بخادم الوقت الحقيقي' : 'الاتصال غير متاح، يتم استخدام بيانات محاكاة'}
        </span>
      </div>
      <LobbyHero snapshot={snapshot} />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <LobbyTable players={snapshot.players} />
        <MatchmakingPanel />
      </div>
    </div>
  );
}
