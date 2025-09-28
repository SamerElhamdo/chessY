import { useCallback, useState } from 'react';
import { Button } from '../../components/ui/button';
import { register } from '../../services/api-client';

export function RegisterPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
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
        await register({ email, username, password });
        setSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل إنشاء الحساب');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, username, password]
  );

  return (
    <section className="mx-auto max-w-lg space-y-6 text-right">
      <header className="space-y-2 text-center md:text-right">
        <h2 className="text-3xl font-bold text-white">إنشاء حساب جديد</h2>
        <p className="text-sm text-slate-400">
          أنشئ حساباً للانضمام إلى منافسات ShamChess وتتبّع تقدمك.
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
          اسم المستخدم
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
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
            minLength={8}
            className="w-full rounded-2xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
          />
          <span className="text-xs text-slate-500">يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.</span>
        </label>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
        </Button>
        {error && <p className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
        {success && <p className="rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p>}
      </form>
    </section>
  );
}
