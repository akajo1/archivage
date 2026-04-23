import { useEffect, useMemo, useState } from 'react';
import type { Role } from '../../auth/types/auth.types';
import { rolePermissionsService } from '../services/rolePermissionsService';
import type { RolePermission } from '../types/rolePermissions.types';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import { Button } from '../../../shared/components/atoms/Button';

const orderedRoles: Role[] = ['admin', 'manager', 'user'];

export const RolePermissionsPage = () => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingRole, setSavingRole] = useState<Role | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await rolePermissionsService.getAll();
        if (active) {
          setPermissions(data);
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

  const allBadges = useMemo<Badge[]>(() => {
    const list = permissions.flatMap((p) => p.badges);
    return Array.from(new Map(list.map((badge) => [badge.id, badge])).values());
  }, [permissions]);

  const allConfidentialities = useMemo<Confidentiality[]>(() => {
    const list = permissions.flatMap((p) => p.confidentialities);
    return Array.from(new Map(list.map((c) => [c.id, c])).values());
  }, [permissions]);

  const toggleBadge = (role: Role, badgeId: string) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.role !== role) return p;

        const already = p.badges.some((b) => b.id === badgeId);
        const badge = allBadges.find((b) => b.id === badgeId);
        if (!badge) return p;

        return {
          ...p,
          badges: already
            ? p.badges.filter((b) => b.id !== badgeId)
            : [...p.badges, badge],
        };
      }),
    );
  };

  const toggleConfidentiality = (role: Role, confidentialityId: string) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.role !== role) return p;

        const already = p.confidentialities.some((c) => c.id === confidentialityId);
        const confidentiality = allConfidentialities.find(
          (c) => c.id === confidentialityId,
        );
        if (!confidentiality) return p;

        return {
          ...p,
          confidentialities: already
            ? p.confidentialities.filter((c) => c.id !== confidentialityId)
            : [...p.confidentialities, confidentiality],
        };
      }),
    );
  };

  const saveRole = async (role: Role) => {
    const permission = permissions.find((p) => p.role === role);
    if (!permission) return;

    if (permission.badges.length === 0 || permission.confidentialities.length === 0) {
      setError('Chaque role doit avoir au moins un badge et un niveau de confidentialite.');
      return;
    }

    try {
      setError('');
      setSavingRole(role);
      const updated = await rolePermissionsService.update(role, {
        badgeIds: permission.badges.map((badge) => badge.id),
        confidentialityIds: permission.confidentialities.map((c) => c.id),
      });

      setPermissions((prev) => prev.map((p) => (p.role === role ? updated : p)));
    } catch {
      setError('Sauvegarde impossible. Verifiez les selections.');
    } finally {
      setSavingRole(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des roles et acces</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configurez les badges et niveaux de confidentialite autorises pour chaque role.
        </p>
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
          {orderedRoles.map((role) => {
            const permission = permissions.find((p) => p.role === role);
            if (!permission) return null;

            return (
              <div key={role} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Role: {role}</h2>
                  <Button
                    size="sm"
                    onClick={() => void saveRole(role)}
                    isLoading={savingRole === role}
                  >
                    Enregistrer
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">Badges autorises</h3>
                    <div className="space-y-2">
                      {allBadges.map((badge) => (
                        <label key={badge.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={permission.badges.some((b) => b.id === badge.id)}
                            onChange={() => toggleBadge(role, badge.id)}
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
                            checked={permission.confidentialities.some((x) => x.id === c.id)}
                            onChange={() => toggleConfidentiality(role, c.id)}
                          />
                          <span>{c.level}</span>
                        </label>
                      ))}
                    </div>
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

