import type { LobbyPlayer } from '../../lobby/types';

interface LobbyTableProps {
  players: LobbyPlayer[];
}

export function LobbyTable({ players }: LobbyTableProps): JSX.Element {
  return (
    <div className="card-surface overflow-hidden rounded-3xl border border-slate-800/70">
      <table className="min-w-full divide-y divide-slate-800 text-right">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">اللاعب</th>
            <th className="px-4 py-3 font-semibold">التقييم</th>
            <th className="px-4 py-3 font-semibold">الدولة</th>
            <th className="px-4 py-3 font-semibold">سلسلة الانتصارات</th>
            <th className="px-4 py-3 font-semibold">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 text-sm text-slate-200">
          {players.map((player) => (
            <tr key={player.id} className="bg-slate-900/40 transition hover:bg-slate-900/60">
              <td className="px-4 py-4 font-semibold text-white">{player.username}</td>
              <td className="px-4 py-4 text-brand-200">{player.rating}</td>
              <td className="px-4 py-4">{player.country}</td>
              <td className="px-4 py-4">
                {player.streak > 0 ? `${player.streak} فوز متتالي` : '—'}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    player.isPlaying
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-slate-700/30 text-slate-200'
                  }`}
                >
                  {player.isPlaying ? 'في مباراة' : 'متاح'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
