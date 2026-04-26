import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  RiFolderOpenLine,
  RiFileList2Line,
  RiTeamLine,
  RiShieldKeyholeLine,
  RiLogoutBoxLine,
  RiWifiLine,
  RiWifiOffLine,
} from 'react-icons/ri';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { Button } from '../atoms/Button';
import { healthService, type BackendHealth } from '../../services/healthService';

const roleColors: Record<string, string> = {
  admin: 'bg-[#ead7ca] text-[#7a4f34]',
  manager: 'bg-[#dae7df] text-[#355246]',
  user: 'bg-[#efe4d2] text-[#6d5638]',
};

interface NavbarProps {
  className?: string;
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  Icon: IconType;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/documents', label: 'Documents', Icon: RiFileList2Line, roles: ['admin', 'manager', 'user'] },
  { to: '/users', label: 'Utilisateurs', Icon: RiTeamLine, roles: ['admin'] },
  { to: '/roles', label: 'Roles', Icon: RiShieldKeyholeLine, roles: ['admin'] },
];

export const Navbar = ({ className = '', onNavigate }: NavbarProps) => {
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

  const visibleItems = user ? navItems.filter((item) => item.roles.includes(user.role)) : [];

  return (
    <aside className={`arch-card flex flex-col rounded-3xl p-4 ${className}`}>
      <Link
        to="/documents"
        onClick={onNavigate}
        className="mb-6 inline-flex items-center gap-2 self-start rounded-full bg-[#ebdcc5] px-3 py-1.5 text-lg font-bold text-[#6f563a]"
      >
        <RiFolderOpenLine className="h-5 w-5" />
        <span>Archivage</span>
      </Link>

      <nav className="space-y-1">
        {visibleItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#806444] text-amber-50 shadow-sm'
                  : 'text-[#625240] hover:bg-[#efe2cf] hover:text-[#3f3328]'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${backendHealth === 'up' ? 'bg-[#dae7df] text-[#355246]' : 'bg-[#f0d3cf] text-[#8b3e34]'}`}
          title="Etat de la connexion backend/database"
        >
          {backendHealth === 'up' ? (
            <>
              <RiWifiLine className="h-3.5 w-3.5" /> Backend OK
            </>
          ) : (
            <>
              <RiWifiOffLine className="h-3.5 w-3.5" /> Backend down
            </>
          )}
        </span>

        {user && (
          <div className="rounded-2xl border border-[#dccdb8] bg-[#f5eddf] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-[#5f4e3a]">{user.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[user.role]}`}>
                {user.role}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mt-3 w-full justify-center gap-1.5"
            >
              <RiLogoutBoxLine className="h-4 w-4" />
              Deconnexion
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
