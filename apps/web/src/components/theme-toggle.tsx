import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../providers/theme-provider';

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      onClick={toggleTheme}
      className="rounded-full border border-slate-700/60 bg-slate-900/40 text-slate-200 hover:bg-slate-800/70"
    >
      <Sun className="h-5 w-5 transition-transform duration-300 ease-in-out [&.hidden]:scale-0" hidden={theme !== 'dark'} />
      <Moon className="h-5 w-5 transition-transform duration-300 ease-in-out [&.hidden]:scale-0" hidden={theme === 'dark'} />
    </Button>
  );
}
