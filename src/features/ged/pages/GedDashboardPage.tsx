import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiMailLine, RiFileList2Line, RiArchiveDrawerLine,
  RiPriceTag3Line, RiTeamLine, RiSettingsLine,
  RiArrowRightLine,
} from 'react-icons/ri';
import { useMailRoutingInbox } from '../../mail-routing/hooks/useMailRouting';
import { documentService } from '../../documents/services/documentService';

export const GedDashboardPage: React.FC = () => {
  const { routings, loading: inboxLoading } = useMailRoutingInbox();
  const [docStats, setDocStats] = useState({ total: 0, archived: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    documentService.getAll()
      .then((docs) => {
        if (cancelled) return;
        setDocStats({
          total: docs.length,
          archived: docs.filter((d) => (d as { status?: string }).status === 'archived').length,
        });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setStatsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const services = [
    {
      title: 'Courrier',
      description: 'Workflows de courrier entrant/sortant',
      href: '/mail-routing/inbox',
      icon: RiMailLine,
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      iconColor: 'text-blue-600 bg-blue-100',
      badge: routings.length > 0 ? routings.length : null,
    },
    {
      title: 'Documents',
      description: 'Gérer tous les documents',
      href: '/documents',
      icon: RiFileList2Line,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
      iconColor: 'text-emerald-600 bg-emerald-100',
      badge: null,
    },
    {
      title: 'Archivage',
      description: 'Consulter les archives',
      href: '/archivage',
      icon: RiArchiveDrawerLine,
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      iconColor: 'text-orange-600 bg-orange-100',
      badge: null,
    },
    {
      title: 'Classification',
      description: 'Badges et confidentialité',
      href: '/classification',
      icon: RiPriceTag3Line,
      color: 'bg-violet-50 border-violet-200 hover:border-violet-400',
      iconColor: 'text-violet-600 bg-violet-100',
      badge: null,
    },
    {
      title: 'Utilisateurs',
      description: 'Gestion des comptes & rôles',
      href: '/users',
      icon: RiTeamLine,
      color: 'bg-pink-50 border-pink-200 hover:border-pink-400',
      iconColor: 'text-pink-600 bg-pink-100',
      badge: null,
    },
    {
      title: 'Paramètres',
      description: 'Rôles & permissions',
      href: '/roles',
      icon: RiSettingsLine,
      color: 'bg-gray-50 border-gray-200 hover:border-gray-400',
      iconColor: 'text-gray-600 bg-gray-100',
      badge: null,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="arch-hero relative overflow-hidden rounded-3xl px-8 py-10 shadow-sm">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">GED Platform</h1>
        <p className="mt-2 text-[#a8c8de]">Gestion Électronique de Documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: 'Documents',
            value: statsLoading ? '…' : docStats.total,
            color: 'text-emerald-600',
          },
          {
            label: 'Courriers en attente',
            value: inboxLoading ? '…' : routings.length,
            color: 'text-blue-600',
          },
          {
            label: 'Archivés',
            value: statsLoading ? '…' : docStats.archived,
            color: 'text-orange-600',
          },
          {
            label: 'Actifs',
            value: statsLoading ? '…' : docStats.total - docStats.archived,
            color: 'text-violet-600',
          },
        ].map((stat) => (
          <div key={stat.label} className="arch-card rounded-2xl p-5">
            <p className="text-sm text-[#456882]">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Services grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#1B3C53]">Services</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.href}
              to={s.href}
              className={`arch-card group flex items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-150 ${s.color}`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.iconColor}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[#1B3C53]">{s.title}</p>
                  {s.badge !== null && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                      {s.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-[#456882]">{s.description}</p>
              </div>
              <RiArrowRightLine className="h-4 w-4 shrink-0 text-[#7aaac4] transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
