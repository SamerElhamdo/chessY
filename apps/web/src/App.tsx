import { useState } from 'react';
import { AppShell } from './layouts/app-shell';
import { LobbyPage } from './pages/lobby';
import { GamePage } from './pages/game';
import { ProfilePage } from './pages/profile';
import { TournamentsPage } from './pages/tournaments';
import { Button } from './components/ui/button';
import { LoginPage } from './pages/auth/login';
import { RegisterPage } from './pages/auth/register';

type View = 'lobby' | 'game' | 'profile' | 'tournaments' | 'login' | 'register';

function App(): JSX.Element {
  const [view, setView] = useState<View>('lobby');

  const { title, subtitle } = (() => {
    switch (view) {
      case 'lobby':
        return {
          title: 'ردهة ShamChess',
          subtitle: 'راقب اللاعبين المتصلين وأطلق مباراة جديدة فوراً'
        };
      case 'game':
        return {
          title: 'غرفة المباراة',
          subtitle: 'تابع مجريات المباراة مع لوحة تحكم كاملة للحركات والدردشة'
        };
      case 'login':
        return {
          title: 'تسجيل الدخول',
          subtitle: 'ادخل بياناتك للوصول إلى حسابك في ShamChess'
        };
      case 'register':
        return {
          title: 'إنشاء حساب جديد',
          subtitle: 'انضم إلى مجتمع ShamChess واستعد للمنافسة'
        };
      case 'profile':
        return {
          title: 'ملفي الشخصي',
          subtitle: 'راجع إنجازاتك وإحصاءات التصنيف'
        };
      case 'tournaments':
        return {
          title: 'البطولات',
          subtitle: 'استكشف البطولات الحية والمقبلة'
        };
      default:
        return {
          title: 'ShamChess',
          subtitle: 'منصة الشطرنج العربية'
        };
    }
  })();

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      navigation={
        <div className="flex items-center gap-2">
          <Button variant={view === 'lobby' ? 'default' : 'ghost'} onClick={() => setView('lobby')}>
            الردهة
          </Button>
          <Button variant={view === 'game' ? 'default' : 'ghost'} onClick={() => setView('game')}>
            المباراة
          </Button>
          <Button variant={view === 'profile' ? 'default' : 'ghost'} onClick={() => setView('profile')}>
            ملفي
          </Button>
          <Button
            variant={view === 'tournaments' ? 'default' : 'ghost'}
            onClick={() => setView('tournaments')}
          >
            البطولات
          </Button>
          <Button variant={view === 'login' ? 'outline' : 'ghost'} onClick={() => setView('login')}>
            تسجيل الدخول
          </Button>
          <Button variant={view === 'register' ? 'outline' : 'ghost'} onClick={() => setView('register')}>
            إنشاء حساب
          </Button>
        </div>
      }
    >
      {view === 'lobby' && <LobbyPage />}
      {view === 'game' && <GamePage />}
      {view === 'profile' && <ProfilePage />}
      {view === 'tournaments' && <TournamentsPage />}
      {view === 'login' && <LoginPage />}
      {view === 'register' && <RegisterPage />}
    </AppShell>
  );
}

export default App;
