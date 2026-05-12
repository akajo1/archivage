import React, { useState } from 'react';
import { Button } from '../../../shared/components/atoms/Button';

/**
 * Page recherche avancée
 */
export const AdvancedSearchPage: React.FC = () => {
  const results: Record<string, unknown>[] = []; // Will be fetched from API
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
    // Will call API to fetch results
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🔍 Recherche Avancée</h1>
        <p className="text-gray-600 mt-1">Rechercher et filtrer les documents avec critères multiples</p>
      </div>

      {/* Search Form */}
      <div className="arch-card rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Texte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texte de recherche</label>
            <input
              type="text"
              placeholder="Titre, descriptif, contenu..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Type de document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option>Tous les types</option>
              <option>Courrier</option>
              <option>Rapport</option>
              <option>Contrat</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option>Tous les statuts</option>
              <option>Brouillon</option>
              <option>En révision</option>
              <option>Validé</option>
              <option>Archivé</option>
            </select>
          </div>

          {/* Confidentialité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confidentialité</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option>Tous</option>
              <option>Public</option>
              <option>Interne</option>
              <option>Confidentiel</option>
              <option>Secret</option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Du</label>
            <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Au</label>
            <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
            <input type="text" placeholder="Nom de l'auteur" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </div>

          {/* Badge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option>Tous</option>
              <option>Critique</option>
              <option>Normal</option>
              <option>Faible</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSearch} variant="primary">
            🔍 Rechercher
          </Button>
          <Button variant="secondary">Réinitialiser</Button>
          <Button variant="secondary">Enregistrer recherche</Button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="arch-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Résultats ({results.length})
          </h2>
          {results.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Aucun résultat trouvé</p>
          ) : (
            <div className="space-y-2">
              {/* Results will be displayed here */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

