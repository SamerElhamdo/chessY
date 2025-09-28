import { useCallback, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { joinQueue, leaveQueue, requestQuickMatch } from '../../../services/matchmaking';
import type { QueueStatus } from '../../../services/matchmaking';

export function MatchmakingPanel(): JSX.Element {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>('idle');
  const [preferredRating, setPreferredRating] = useState<[number, number]>([1400, 2000]);
  const [lastMatchId, setLastMatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJoinQueue = useCallback(async () => {
    try {
      setError(null);
      setQueueStatus('joining');
      await joinQueue();
      setQueueStatus('queued');
    } catch (err) {
      setQueueStatus('idle');
      setError('تعذر الانضمام إلى قائمة الانتظار، حاول مرة أخرى.');
      console.error(err);
    }
  }, []);

  const handleLeaveQueue = useCallback(async () => {
    try {
      setError(null);
      setQueueStatus('leaving');
      await leaveQueue();
      setQueueStatus('idle');
    } catch (err) {
      setQueueStatus('queued');
      setError('تعذر مغادرة قائمة الانتظار، حاول مرة أخرى.');
      console.error(err);
    }
  }, []);

  const handleQuickMatch = useCallback(async () => {
    try {
      setError(null);
      const result = await requestQuickMatch(preferredRating);
      setLastMatchId(result.matchId);
    } catch (err) {
      setError('فشل إنشاء مباراة سريعة.');
      console.error(err);
    }
  }, [preferredRating]);

  return (
    <section className="card-surface space-y-6 rounded-3xl border border-slate-800/70 p-8 text-right">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-white">انضم للمباراة السريعة</h2>
        <p className="text-sm text-slate-400">
          اختر نطاق التقييم المفضل لديك واضغط على انضمام للعثور على خصم مناسب فورياً.
        </p>
      </header>

      <div className="space-y-4">
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          نطاق التقييم المفضل
          <input
            type="range"
            min={800}
            max={2400}
            step={100}
            value={preferredRating[0]}
            onChange={(event) =>
              setPreferredRating(([_, max]) => [Number(event.target.value), Math.max(max, Number(event.target.value) + 100)])
            }
            className="accent-brand-400"
          />
          <input
            type="range"
            min={preferredRating[0] + 100}
            max={2600}
            step={100}
            value={preferredRating[1]}
            onChange={(event) =>
              setPreferredRating(([min]) => [min, Math.max(Number(event.target.value), min + 100)])
            }
            className="accent-brand-400"
          />
          <span className="text-xs text-slate-400">
            من {preferredRating[0]} إلى {preferredRating[1]} نقطة
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {queueStatus === 'queued' ? (
          <Button variant="outline" onClick={handleLeaveQueue} disabled={queueStatus === 'leaving'}>
            {queueStatus === 'leaving' ? 'جاري المغادرة...' : 'مغادرة الانتظار'}
          </Button>
        ) : (
          <Button onClick={handleJoinQueue} disabled={queueStatus === 'joining'}>
            {queueStatus === 'joining' ? 'جاري الانضمام...' : 'انضم الآن'}
          </Button>
        )}
        <Button variant="ghost" onClick={handleQuickMatch}>
          مباراة فورية
        </Button>
      </div>

      {lastMatchId && (
        <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          تمت تهيئة المباراة برقم <span className="font-semibold">{lastMatchId}</span>.
        </p>
      )}

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p>
      )}
    </section>
  );
}
