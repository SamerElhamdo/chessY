interface GameTimersProps {
  whiteTime: number;
  blackTime: number;
  currentTurn: 'white' | 'black';
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function GameTimers({ whiteTime, blackTime, currentTurn }: GameTimersProps): JSX.Element {
  const total = 300;
  const whiteProgress = Math.max(0, Math.min(100, (whiteTime / total) * 100));
  const blackProgress = Math.max(0, Math.min(100, (blackTime / total) * 100));

  return (
    <section className="card-surface grid gap-4 rounded-3xl border border-slate-800/70 p-6 text-right">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-white">عدادات الوقت</h3>
        <p className="text-xs text-slate-400">نظام 5 دقائق + بدون إضافة</p>
      </header>

      <div className="space-y-4">
        <article className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>اللاعب الأبيض</span>
            <span className="font-mono text-xl font-bold text-white">{formatTime(whiteTime)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800/70">
            <div
              className="h-full rounded-full bg-brand-400 transition-all"
              style={{ width: `${whiteProgress}%` }}
            />
          </div>
          {currentTurn === 'white' && <p className="text-xs text-brand-200">دورك في اللعب</p>}
        </article>

        <article className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>اللاعب الأسود</span>
            <span className="font-mono text-xl font-bold text-white">{formatTime(blackTime)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800/70">
            <div
              className="h-full rounded-full bg-brand-400 transition-all"
              style={{ width: `${blackProgress}%` }}
            />
          </div>
          {currentTurn === 'black' && <p className="text-xs text-brand-200">دورك في اللعب</p>}
        </article>
      </div>
    </section>
  );
}
