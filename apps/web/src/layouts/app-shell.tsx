import type { PropsWithChildren, ReactNode } from 'react';
import { ThemeToggle } from '../components/theme-toggle';

interface AppShellProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  navigation?: ReactNode;
}

export function AppShell({ children, title, subtitle, navigation }: AppShellProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="space-y-1 text-right">
            <p className="text-xs font-semibold tracking-[0.3em] text-brand-300">ShamChess</p>
            <h1 className="font-display text-2xl font-extrabold text-white">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {navigation}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container flex-1 py-10">{children}</main>
      <footer className="border-t border-slate-800/60 bg-slate-950/40 py-6">
        <div className="container text-right text-sm text-slate-400">
          © {new Date().getFullYear()} ShamChess. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
