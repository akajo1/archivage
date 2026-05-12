import React from 'react';
import { Link } from 'react-router-dom';
import { useMailRoutingInbox } from '../../mail-routing/hooks/useMailRouting';

/**
 * Dashboard principal de la plateforme GED
 */
export const GedDashboardPage: React.FC = () => {
  const { routings: inboxCount } = useMailRoutingInbox();

  const dashboardCards = [
    {
      title: '📮 Mail Routing',
      description: 'Gérer les workflows de courrier',
      count: inboxCount.length,
      href: '/mail-routing/inbox',
      color: 'bg-blue-50 border-blue-200',
      icon: '📬',
    },
    {
      title: '📄 Mes Documents',
      description: 'Consulter mes documents',
      count: 0, // Will be fetched
      href: '/documents',
      color: 'bg-green-50 border-green-200',
      icon: '📑',
    },
    {
      title: '🏷️ Classification',
      description: 'Gérer les catégories',
      count: 0,
      href: '/classification',
      color: 'bg-purple-50 border-purple-200',
      icon: '🏷️',
    },
    {
      title: '📦 Archivage',
      description: 'Consulter les archives',
      count: 0,
      href: '/archivage',
      color: 'bg-orange-50 border-orange-200',
      icon: '📦',
    },
    {
      title: '👥 Utilisateurs',
      description: 'Gérer utilisateurs & rôles',
      count: 0,
      href: '/admin/users',
      color: 'bg-pink-50 border-pink-200',
      icon: '👥',
    },
    {
      title: '⚙️ Paramètres',
      description: 'Configuration système',
      count: 0,
      href: '/admin/settings',
      color: 'bg-gray-50 border-gray-200',
      icon: '⚙️',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">📁 GED Platform</h1>
        <p className="text-lg text-gray-600">Gestion Électronique de Documents</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="arch-card rounded-lg p-4">
          <p className="text-gray-600 text-sm">Documents en attente d'action</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{inboxCount.length}</p>
        </div>
        <div className="arch-card rounded-lg p-4">
          <p className="text-gray-600 text-sm">Documents archivés</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">0</p>
        </div>
        <div className="arch-card rounded-lg p-4">
          <p className="text-gray-600 text-sm">Utilisateurs actifs</p>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
      </div>

      {/* Main Services Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardCards.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className={`arch-card rounded-lg p-6 border-2 hover:shadow-lg transition-shadow cursor-pointer ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl mb-1">{card.icon}</p>
                  <h3 className="font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                </div>
                {card.count > 0 && (
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {card.count}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="arch-card rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activité Récente</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <p className="text-gray-700">Vous avez reçu un nouveau document</p>
            <span className="text-xs text-gray-500">à l'instant</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <p className="text-gray-700">Workflow "Demande Remboursement" complété</p>
            <span className="text-xs text-gray-500">il y a 2 heures</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-700">5 documents archivés</p>
            <span className="text-xs text-gray-500">hier</span>
          </div>
        </div>
      </div>
    </div>
  );
};

