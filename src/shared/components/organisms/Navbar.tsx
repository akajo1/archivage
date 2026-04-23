import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { Button } from '../atoms/Button';
import { healthService, type BackendHealth } from '../../services/healthService';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
};

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [backendHealth, setBackendHealth] = useState<BackendHealth>('down');

  useEffect(() => {
    let active = true;

    const runCheck = async () => {
      const status = await healthService.check();
      if (active) {
        setBackendHealth(status);
      }
    };

    void runCheck();
    const id = window.setInterval(() => {
      void runCheck();
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/documents" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <span>📁</span>
            <span>Archivage</span>
          </Link>

          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${backendHealth === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              title="Etat de la connexion backend/database"
            >
              {backendHealth === 'up' ? 'Backend OK' : 'Backend down'}
            </span>
            {user && (
              <>
                <Link to="/documents" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Documents
                </Link>
                {user.role === 'admin' && (
                  <Link to="/users" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Utilisateurs
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/roles" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Roles
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

