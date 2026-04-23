import { useEffect, useState } from 'react';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { badgeService } from '../../badges/services/badgeService';
import { confidentialityService } from '../../confidentiality/services/confidentialityService';
import { rolesService } from '../services/rolesService';
import type { AppRole } from '../types/roles.types';

export const RolePermissionsPage = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [allConfidentialities, setAllConfidentialities] = useState<Confidentiality[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [newRole, setNewRole] = useState({
    key: '',
    name: '',
    description: '',
    badgeIds: [] as string[],
    confidentialityIds: [] as string[],
    documentAccesses: ['read'] as Array<'read' | 'create' | 'edit'>,
  });

  const loadRoles = async (search?: string) => {
    const data = await rolesService.getAll(search?.trim() || undefined);
    setRoles(data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [rolesData, badgesData, confidentialityData] = await Promise.all([
          rolesService.getAll(),
          badgeService.getAll(),
          confidentialityService.getAll(),
        ]);
        if (active) {
          setRoles(rolesData);
          setAllBadges(badgesData);
          setAllConfidentialities(confidentialityData);
          setLoading(false);
        }
      } catch {
        if (active) {
          setError('Impossible de charger la configuration des roles.');
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const toggleNewRoleBadge = (badgeId: string) => {
    setNewRole((prev) => ({
      ...prev,
      badgeIds: prev.badgeIds.includes(badgeId)
        ? prev.badgeIds.filter((id) => id !== badgeId)
        : [...prev.badgeIds, badgeId],
    }));
  };

  const toggleNewRoleConfidentiality = (confidentialityId: string) => {
    setNewRole((prev) => ({
      ...prev,
      confidentialityIds: prev.confidentialityIds.includes(confidentialityId)
        ? prev.confidentialityIds.filter((id) => id !== confidentialityId)
        : [...prev.confidentialityIds, confidentialityId],
    }));
  };

  const createRole = async () => {
    if (
      !newRole.key ||
      !newRole.name ||
      newRole.badgeIds.length === 0 ||
      newRole.confidentialityIds.length === 0 ||
      newRole.documentAccesses.length === 0
    ) {
      setError(
        'Renseignez key/nom et selectionnez au moins un badge, une confidentialite et un acces document.',
      );
      return;
    }

    try {
      setError('');
      const created = await rolesService.create({
        key: newRole.key,
        name: newRole.name,
        description: newRole.description || undefined,
        badgeIds: newRole.badgeIds,
        confidentialityIds: newRole.confidentialityIds,
        documentAccesses: newRole.documentAccesses,
      });

      setRoles((prev) => [created, ...prev]);
      setNewRole({
        key: '',
        name: '',
        description: '',
        badgeIds: [],
        confidentialityIds: [],
        documentAccesses: ['read'],
      });
    } catch {
      setError('Creation du role impossible.');
    }
  };

  const savePermissions = async (role: AppRole) => {
    const badges = role.badges ?? [];
    const confidentialities = role.confidentialities ?? [];

    if (badges.length === 0 || confidentialities.length === 0) {
      setError('Chaque role doit garder au moins un badge et une confidentialite.');
      return;
    }

    try {
      setError('');
      setSavingRole(role.id);
      const updated = await rolesService.update(role.id, {
        badgeIds: badges.map((badge) => badge.id),
        confidentialityIds: confidentialities.map((confidentiality) => confidentiality.id),
        documentAccesses: role.documentAccesses,
      });
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      setError('Mise a jour des permissions impossible.');
    } finally {
      setSavingRole(null);
    }
  };

  const toggleRoleBadge = (roleId: string, badgeId: string) => {
    const badge = allBadges.find((item) => item.id === badgeId);
    if (!badge) return;

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        const currentBadges = role.badges ?? [];
        const already = currentBadges.some((item) => item.id === badgeId);

        return {
          ...role,
          badges: already
            ? currentBadges.filter((item) => item.id !== badgeId)
            : [...currentBadges, badge],
        };
      }),
    );
  };

  const toggleRoleConfidentiality = (roleId: string, confidentialityId: string) => {
    const confidentiality = allConfidentialities.find(
      (item) => item.id === confidentialityId,
    );
    if (!confidentiality) return;

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        const currentConfidentialities = role.confidentialities ?? [];
        const already = currentConfidentialities.some(
          (item) => item.id === confidentialityId,
        );

        return {
          ...role,
          confidentialities: already
            ? currentConfidentialities.filter((item) => item.id !== confidentialityId)
            : [...currentConfidentialities, confidentiality],
        };
      }),
    );
  };

  const toggleRoleAccess = (
    roleId: string,
    access: 'read' | 'create' | 'edit',
  ) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        const current = role.documentAccesses ?? [];
        const exists = current.includes(access);

        return {
          ...role,
          documentAccesses: exists
            ? current.filter((item) => item !== access)
            : [...current, access],
        };
      }),
    );
  };

  const toggleNewRoleAccess = (access: 'read' | 'create' | 'edit') => {
    setNewRole((prev) => {
      const exists = prev.documentAccesses.includes(access);
      return {
        ...prev,
        documentAccesses: exists
          ? prev.documentAccesses.filter((item) => item !== access)
          : [...prev.documentAccesses, access],
      };
    });
  };

  const renameRole = async (role: AppRole) => {
    const nextName = prompt('Nouveau nom du role', role.name)?.trim();
    if (!nextName) return;

    const nextKey = prompt('Nouvelle key du role', role.key)?.trim();
    if (!nextKey) return;

    try {
      setSavingRole(role.id);
      const updated = await rolesService.update(role.id, {
        name: nextName,
        key: nextKey,
      });
      setRoles((prev) => prev.map((item) => (item.id === role.id ? updated : item)));
    } catch {
      setError('Mise a jour du role impossible.');
    } finally {
      setSavingRole(null);
    }
  };

  const deleteRole = async (role: AppRole) => {
    if (!confirm(`Supprimer le role ${role.name} ?`)) return;

    try {
      await rolesService.remove(role.id);
      setRoles((prev) => prev.filter((item) => item.id !== role.id));
    } catch {
      setError('Suppression du role impossible (utilise ou role systeme).');
    }
  };

  const searchRoles = async () => {
    try {
      setError('');
      await loadRoles(query);
    } catch {
      setError('Recherche impossible.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des roles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Creez, recherchez, modifiez et supprimez des roles, puis attribuez leurs acces.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recherche</h2>
        <div className="flex gap-3">
          <Input
            placeholder="Rechercher par nom ou key..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="button" variant="secondary" onClick={() => void searchRoles()}>
            Rechercher
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Creation d'un role</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Nom"
            value={newRole.name}
            onChange={(event) =>
              setNewRole((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <Input
            placeholder="Key (ex: auditeur)"
            value={newRole.key}
            onChange={(event) =>
              setNewRole((prev) => ({ ...prev, key: event.target.value }))
            }
          />
          <Input
            placeholder="Description"
            value={newRole.description}
            onChange={(event) =>
              setNewRole((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Badges autorises</h3>
            <div className="space-y-2">
              {allBadges.map((badge) => (
                <label key={badge.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={newRole.badgeIds.includes(badge.id)}
                    onChange={() => toggleNewRoleBadge(badge.id)}
                  />
                  <span>{badge.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Confidentialites autorisees</h3>
            <div className="space-y-2">
              {allConfidentialities.map((confidentiality) => (
                <label
                  key={confidentiality.id}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={newRole.confidentialityIds.includes(confidentiality.id)}
                    onChange={() =>
                      toggleNewRoleConfidentiality(confidentiality.id)
                    }
                  />
                  <span>{confidentiality.level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700">Acces document</h3>
          <div className="flex flex-wrap gap-3">
            {(['read', 'create', 'edit'] as const).map((access) => (
              <label key={access} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newRole.documentAccesses.includes(access)}
                  onChange={() => toggleNewRoleAccess(access)}
                />
                <span>{access}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={() => void createRole()}>Creer le role</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Chargement...
        </div>
      ) : (
        <div className="space-y-6">
          {roles.map((role) => {
            return (
              <div key={role.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{role.name}</h2>
                    <p className="text-xs text-gray-500">key: {role.key}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void renameRole(role)}
                      isLoading={savingRole === role.id}
                    >
                      Modifier
                    </Button>
                    <Button size="sm" onClick={() => void savePermissions(role)} isLoading={savingRole === role.id}>
                      Enregistrer acces
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => void deleteRole(role)}>
                      Supprimer
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">Badges autorises</h3>
                    <div className="space-y-2">
                      {allBadges.map((badge) => (
                        <label key={badge.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={(role.badges ?? []).some((item) => item.id === badge.id)}
                            onChange={() => toggleRoleBadge(role.id, badge.id)}
                          />
                          <span>{badge.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">Confidentialites autorisees</h3>
                    <div className="space-y-2">
                      {allConfidentialities.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={(role.confidentialities ?? []).some((item) => item.id === c.id)}
                            onChange={() => toggleRoleConfidentiality(role.id, c.id)}
                          />
                          <span>{c.level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Acces document</h3>
                  <div className="flex flex-wrap gap-3">
                    {(['read', 'create', 'edit'] as const).map((access) => (
                      <label key={access} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={(role.documentAccesses ?? []).includes(access)}
                          onChange={() => toggleRoleAccess(role.id, access)}
                        />
                        <span>{access}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

