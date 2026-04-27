import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/components/organisms/Navbar';
import { authService } from '../features/auth/services/authService';
import { useAuthStore } from '../features/auth/store/authStore';

export const Layout = () => {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;
    const syncCurrentUser = () => {
      authService
        .me()
        .then((user) => {
          if (active) setUser(user);
        })
        .catch(() => {
          if (active) logout();
        });
    };

    syncCurrentUser();
    const intervalId = window.setInterval(syncCurrentUser, 10000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, logout, setUser]);

  return (
    <div className="min-h-screen bg-transparent md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-4 md:p-4">
      <aside className="hidden md:sticky md:top-4 md:block md:h-[calc(100vh-2rem)]">
        <Navbar className="h-full" />
      </aside>

      <div className="min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 border-b border-[#c4d4df] bg-white/80 px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full border border-[#c4d4df] bg-[#edf4f8] px-3 py-1.5 text-sm font-medium text-[#234C6A]"
            >
              Menu
            </button>
            <span className="rounded-full bg-[#234C6A] px-3 py-1 text-sm font-semibold text-white">
              Archivage
            </span>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative h-full w-[84%] max-w-[320px] p-4">
            <Navbar className="h-full" onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
