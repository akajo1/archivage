import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/components/organisms/Navbar';
import { authService } from '../features/auth/services/authService';
import { useAuthStore } from '../features/auth/store/authStore';

export const Layout = () => {
  const { isAuthenticated, setUser, logout } = useAuthStore();

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

