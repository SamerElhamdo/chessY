import type { MoveRecord } from '../types';

interface MoveListProps {
  moves: MoveRecord[];
}

export function MoveList({ moves }: MoveListProps): JSX.Element {
  return (
    <div className="card-surface flex h-full flex-col rounded-3xl border border-slate-800/70 p-6">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">سجل النقلات</h3>
        <span className="text-xs text-slate-500">{moves.length} نقلة</span>
      </header>
      <ol className="flex flex-1 flex-col gap-2 overflow-y-auto pr-2 text-sm">
        {moves.map((entry, index) => (
          <li
            key={entry.move}
            className="rounded-2xl border border-slate-800/70 bg-slate-900/50 px-4 py-2 text-slate-200"
          >
            <span className="ml-2 inline-block w-8 text-xs text-slate-500">{index + 1}.</span>
            <span className="font-medium text-white">{entry.notation}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
