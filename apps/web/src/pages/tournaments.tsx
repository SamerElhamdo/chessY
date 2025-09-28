import { useQuery } from '@tanstack/react-query';
import { fetchTournaments } from '../services/tournaments';

const statusLabels: Record<string, string> = {
  upcoming: 'قريباً',
  live: 'مباشرة',
  completed: 'منتهية'
};

export function TournamentsPage(): JSX.Element {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tournaments'],
    queryFn: fetchTournaments
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-48 animate-pulse rounded-3xl bg-slate-800/40" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface space-y-4 rounded-3xl border border-rose-500/30 p-8 text-right">
        <p className="text-sm text-rose-200">{(error as Error).message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500">لا توجد بطولات متاحة حالياً.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {data.map((tournament) => (
          <article
            key={tournament.id}
            className="card-surface space-y-4 rounded-3xl border border-slate-800/70 p-8 text-right"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{tournament.name}</h3>
                <p className="text-xs text-slate-400">
                  {new Intl.DateTimeFormat('ar-EG', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  }).format(new Date(tournament.startDate))}
                </p>
              </div>
              <span
                className={`rounded-2xl border px-3 py-1 text-xs font-semibold ${
                  tournament.status === 'live'
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                    : tournament.status === 'completed'
                    ? 'border-slate-600/60 bg-slate-800/40 text-slate-300'
                    : 'border-brand-400/60 bg-brand-500/10 text-brand-200'
                }`}
              >
                {statusLabels[tournament.status] ?? tournament.status}
              </span>
            </header>

            <dl className="grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="space-y-1">
                <dt className="text-xs text-slate-500">قيمة الجوائز</dt>
                <dd className="font-semibold text-white">${tournament.prizePool.toLocaleString('en-US')}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs text-slate-500">عدد المشاركين</dt>
                <dd className="font-semibold text-white">{tournament.entrants}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="w-full rounded-2xl border border-slate-800/70 bg-slate-900/40 px-5 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              عرض التفاصيل
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
