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
  RiDashboardLine,
} from 'react-icons/ri';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { Button } from '../atoms/Button';
import { healthService, type BackendHealth } from '../../services/healthService';

interface NavbarProps {
  className?: string;
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  Icon: IconType;
  roles: string[];
  activeColor: string;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Tableau de bord', Icon: RiDashboardLine, roles: ['admin', 'manager', 'user'], activeColor: 'text-[#2FA084]' },
  { to: '/documents', label: 'Documents', Icon: RiFileList2Line, roles: ['admin', 'manager', 'user'], activeColor: 'text-[#5ecbaf]' },
  { to: '/users', label: 'Utilisateurs', Icon: RiTeamLine, roles: ['admin'], activeColor: 'text-[#7aaac4]' },
  { to: '/roles', label: 'Roles', Icon: RiShieldKeyholeLine, roles: ['admin'], activeColor: 'text-[#a8c8de]' },
];

const roleColors: Record<string, { bg: string; text: string; dot: string }> = {
  admin:   { bg: 'bg-[#BD114A]/20',  text: 'text-[#f47faa]', dot: 'bg-[#BD114A]'  },
  manager: { bg: 'bg-[#2FA084]/20',  text: 'text-[#5ecbaf]', dot: 'bg-[#2FA084]'  },
  user:    { bg: 'bg-[#456882]/30',  text: 'text-[#a8c8de]', dot: 'bg-[#456882]'  },
};

export const Navbar = ({ className = '', onNavigate }: NavbarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [backendHealth, setBackendHealth] = useState<BackendHealth>('down');

  useEffect(() => {
    let active = true;
    const runCheck = async () => {
      const s = await healthService.check();
      if (active) setBackendHealth(s);
    };
    void runCheck();
    const id = window.setInterval(() => { void runCheck(); }, 30000);
    return () => { active = false; window.clearInterval(id); };
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const visibleItems = user ? navItems.filter((item) => item.roles.includes(user.role)) : [];
  const rc = user ? (roleColors[user.role] ?? roleColors.user) : roleColors.user;
  const initials = user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '';

  return (
    <aside className={`flex flex-col rounded-3xl bg-linear-to-b from-[#1B3C53] via-[#1d4361] to-[#152d3e] p-4 shadow-2xl ring-1 ring-white/10 ${className}`}>

      {/* ── Logo ── */}
      <Link
        to="/"
        onClick={onNavigate}
        style={{ color: '#ffffff' }}
        className="mb-7 inline-flex items-center gap-2.5 self-start rounded-2xl px-1 py-1 text-base font-extrabold transition-opacity hover:opacity-80"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2FA084]/20 ring-1 ring-[#2FA084]/40">
          <RiFolderOpenLine className="h-4.5 w-4.5 text-[#2FA084]" />
        </span>
        <span className="tracking-tight">Archivage</span>
      </Link>

      {/* ── Section label ── */}
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        Navigation
      </p>

      {/* ── Nav items ── */}
      <nav className="space-y-0.5">
        {visibleItems.map(({ to, label, Icon, activeColor }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            style={({ isActive }) => ({
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.85)',
            })}
            className={({ isActive }) =>
              `relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#234C6A] shadow-md ring-1 ring-white/10'
                  : 'hover:bg-white/10'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-[#2FA084]" />
                )}
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${isActive ? activeColor : ''}`} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        {/* ── Divider ── */}
        <div className="h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

        {/* ── Backend status ── */}
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
            backendHealth === 'up'
              ? 'bg-[#2FA084]/10 text-[#5ecbaf] ring-[#2FA084]/20'
              : 'bg-[#BD114A]/10 text-[#f26d92] ring-[#BD114A]/20'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${backendHealth === 'up' ? 'bg-[#2FA084]' : 'bg-[#BD114A]'} animate-pulse`} />
          {backendHealth === 'up'
            ? <><RiWifiLine className="h-3.5 w-3.5" /> Backend OK</>
            : <><RiWifiOffLine className="h-3.5 w-3.5" /> Backend down</>}
        </div>

        {/* ── User card ── */}
        {user && (
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#234C6A] to-[#2d6080] text-xs font-bold text-white ring-2 ring-white/15">
                  {initials}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${rc.dot} ring-2 ring-[#1B3C53]`} />
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${rc.bg} ${rc.text}`}>
                  {user.role}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mt-3 w-full justify-center gap-1.5 rounded-xl border border-white/8 text-white/50 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white"
            >
              <RiLogoutBoxLine className="h-3.5 w-3.5" /> Déconnexion
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
