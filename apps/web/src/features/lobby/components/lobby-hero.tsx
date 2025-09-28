import type { LobbySnapshot } from '../../lobby/types';

const numberFormatter = new Intl.NumberFormat('ar-EG');

interface LobbyHeroProps {
  snapshot: LobbySnapshot;
}

export function LobbyHero({ snapshot }: LobbyHeroProps): JSX.Element {
  const { summary } = snapshot;

  const stats = [
    {
      label: 'لاعبون متصلون',
      value: numberFormatter.format(summary.totalPlayers)
    },
    {
      label: 'مباريات نشطة',
      value: numberFormatter.format(summary.activeGames)
    },
    {
      label: 'متوسط التقييم',
      value: numberFormatter.format(summary.averageRating)
    }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((item) => (
        <article
          key={item.label}
          className="card-surface rounded-3xl border border-slate-800/70 p-6 text-right shadow-brand-500/10"
        >
          <p className="text-sm text-slate-400">{item.label}</p>
          <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
        </article>
      ))}
    </section>
  );
}
