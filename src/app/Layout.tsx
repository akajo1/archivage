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
    authService
      .me()
      .then((user) => {
        if (active) setUser(user);
      })
      .catch(() => {
        if (active) logout();
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, logout, setUser]);

  return (
    <div className="min-h-screen bg-transparent md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-4 md:p-4">
      <aside className="hidden md:sticky md:top-4 md:block md:h-[calc(100vh-2rem)]">
        <Navbar className="h-full" />
      </aside>

      <div className="min-w-0">
        <header className="arch-panel sticky top-0 z-40 px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full border border-[#cfbfa7] bg-[#f7efe2] px-3 py-1.5 text-sm font-medium text-[#5f4c35]"
            >
              Menu
            </button>
            <span className="rounded-full bg-[#ebdcc5] px-3 py-1 text-sm font-semibold text-[#6f563a]">
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
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative h-full w-[84%] max-w-[320px] p-4">
            <Navbar className="h-full" onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
