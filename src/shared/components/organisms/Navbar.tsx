import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { Button } from '../atoms/Button';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
};

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
            {user && (
              <>
                <Link to="/documents" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Documents
                </Link>
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

