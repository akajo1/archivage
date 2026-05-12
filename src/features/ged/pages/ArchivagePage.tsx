import React, { useState } from 'react';
import { Button } from '../../../shared/components/atoms/Button';

/**
 * Page archivage - Gestion des documents archivés
 */
export const ArchivagePage: React.FC = () => {
  const [archivedDocs, setArchivedDocs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📦 Archivage</h1>
        <p className="text-gray-600 mt-1">Gérer les documents archivés et la rétention</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="arch-card rounded-lg p-4">
          <p className="text-gray-600 text-sm">Documents archivés</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="arch-card rounded-lg p-4">
          <p className="text-gray-600 text-sm">Espace utilisé</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0 GB</p>
        </div>
        <div className="arch-card rounded-lg p-4">
          <p className="text-gray-600 text-sm">En cours de suppression</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="arch-card rounded-lg p-4">
          <p className="text-gray-600 text-sm">Hold légal</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="arch-card rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Rechercher dans les archives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="date">Triés par date</option>
            <option value="name">Triés par nom</option>
            <option value="size">Triés par taille</option>
          </select>
          <Button>Exporter archives</Button>
        </div>
      </div>

      {/* Archived Documents List */}
      {archivedDocs.length === 0 ? (
        <div className="arch-card rounded-lg p-8 text-center">
          <p className="text-gray-600">Aucun document archivé pour le moment</p>
        </div>
      ) : (
        <div className="arch-card rounded-lg p-6">
          {/* List will be populated */}
        </div>
      )}

      {/* Archive Management Info */}
      <div className="arch-card rounded-lg p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Gestion de l'archivage</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Les documents archivés sont protégés contre les modifications</li>
          <li>• Rétention automatique basée sur les politiques configurées</li>
          <li>• Hold légal disponible pour conformité</li>
          <li>• Export et sauvegarde externe supportés</li>
        </ul>
      </div>
    </div>
  );
};

