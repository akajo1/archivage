import React, { useState } from 'react';
import { Button } from '../../../shared/components/atoms/Button';

/**
 * Page classification - Gestion des badges et confidentialité
 */
export const ClassificationPage: React.FC = () => {
  const [badges, setBadges] = useState<any[]>([
    { id: '1', name: 'critique', color: '#ef4444', count: 5 },
    { id: '2', name: 'normal', color: '#3b82f6', count: 12 },
    { id: '3', name: 'faible', color: '#6b7280', count: 8 },
  ]);

  const [confidentialities] = useState<any[]>([
    { id: '1', level: 'public', count: 8 },
    { id: '2', level: 'interne', count: 15 },
    { id: '3', level: 'confidentiel', count: 12 },
    { id: '4', level: 'secret', count: 3 },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🏷️ Classification</h1>
        <p className="text-gray-600 mt-1">Gérer badges et niveaux de confidentialité</p>
      </div>

      {/* Badges Section */}
      <div className="arch-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Badges</h2>
          <Button size="sm">Ajouter un badge</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="border-2 rounded-lg p-4"
              style={{ borderColor: badge.color, backgroundColor: badge.color + '10' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{badge.name.toUpperCase()}</p>
                  <p className="text-sm text-gray-600 mt-1">{badge.count} documents</p>
                </div>
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: badge.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidentiality Section */}
      <div className="arch-card rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Niveaux de Confidentialité</h2>
        <div className="space-y-3">
          {confidentialities.map((conf) => (
            <div
              key={conf.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{conf.level.toUpperCase()}</p>
                <p className="text-sm text-gray-600">{conf.count} documents</p>
              </div>
              <div className="text-right">
                <button className="text-xs text-blue-600 hover:underline mr-2">Éditer</button>
                <button className="text-xs text-red-600 hover:underline">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classification Rules */}
      <div className="arch-card rounded-lg p-6 bg-green-50 border border-green-200">
        <h3 className="font-semibold text-green-900 mb-2">📋 Règles de Classification</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ Tous les documents doivent avoir un badge</li>
          <li>✓ Tous les documents doivent avoir un niveau de confidentialité</li>
          <li>✓ Les documents secrets ne peuvent être partagés que avec admin</li>
          <li>✓ Audit automatique disponible</li>
        </ul>
      </div>
    </div>
  );
};

