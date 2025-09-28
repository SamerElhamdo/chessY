import { useCallback, useState } from 'react';
import { Button } from '../../components/ui/button';
import { login } from '../../services/api-client';

export function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        await login({ email, password });
        setSuccess('تم تسجيل الدخول بنجاح!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password]
  );

  return (
    <section className="mx-auto max-w-lg space-y-6 text-right">
      <header className="space-y-2 text-center md:text-right">
        <h2 className="text-3xl font-bold text-white">تسجيل الدخول</h2>
        <p className="text-sm text-slate-400">
          أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة تحكم ShamChess.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card-surface space-y-5 rounded-3xl border border-slate-800/70 p-8">
        <label className="block space-y-2 text-sm text-slate-200">
          البريد الإلكتروني
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-2xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
          />
        </label>
        <label className="block space-y-2 text-sm text-slate-200">
          كلمة المرور
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-2xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
          />
        </label>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </Button>
        {error && <p className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
        {success && <p className="rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p>}
      </form>
    </section>
  );
}
