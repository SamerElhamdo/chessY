import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../services/profile';

export function ProfilePage(): JSX.Element {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile
  });

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-3xl bg-slate-800/40" />;
  }

  if (error) {
    return (
      <div className="card-surface space-y-4 rounded-3xl border border-rose-500/30 p-8 text-right">
        <p className="text-sm text-rose-200">{(error as Error).message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="self-start rounded-2xl border border-slate-700/70 bg-slate-900/40 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-400">لا توجد بيانات متاحة حالياً.</p>;
  }

  return (
    <section className="card-surface space-y-6 rounded-3xl border border-slate-800/70 p-10 text-right">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">{data.username}</h2>
          <p className="text-sm text-slate-400">{data.email}</p>
        </div>
        <div className="rounded-3xl border border-brand-400/40 bg-brand-500/10 px-6 py-3 text-center">
          <p className="text-xs text-brand-200">التصنيف الحالي</p>
          <p className="text-2xl font-bold text-white">{data.rating}</p>
        </div>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
          <dt className="text-xs text-slate-500">الدولة</dt>
          <dd className="text-sm font-semibold text-slate-100">{data.country}</dd>
        </div>
        <div className="space-y-1 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
          <dt className="text-xs text-slate-500">آخر تحديث</dt>
          <dd className="text-sm font-semibold text-slate-100">
            {new Intl.DateTimeFormat('ar-EG', {
              dateStyle: 'medium',
              timeStyle: 'short'
            }).format(Date.now())}
          </dd>
        </div>
      </dl>

      {data.biography ? (
        <article className="space-y-2">
          <h3 className="text-lg font-semibold text-white">نبذة</h3>
          <p className="leading-7 text-slate-300">{data.biography}</p>
        </article>
      ) : (
        <p className="text-sm text-slate-500">لم يتم إضافة نبذة بعد.</p>
      )}

      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-5 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
      >
        {isFetching ? 'جاري التحديث...' : 'تحديث البيانات'}
      </button>
    </section>
  );
}
