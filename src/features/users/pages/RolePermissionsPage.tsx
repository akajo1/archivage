import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiPencilLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiCloseLine,
} from 'react-icons/ri';
import Swal from 'sweetalert2';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import { Button } from '../../../shared/components/atoms/Button';
import { IconButton } from '../../../shared/components/atoms/IconButton';
import { Input } from '../../../shared/components/atoms/Input';
import { badgeService } from '../../badges/services/badgeService';
import { confidentialityService } from '../../confidentiality/services/confidentialityService';
import { rolesService } from '../services/rolesService';
import { usePermissions, useRefreshPermissions } from '../../auth/hooks/usePermissions';
import { useAuthStore } from '../../auth/store/authStore';
import {
  ROLE_FEATURE_KEYS,
  type AppRole,
  type FeaturePermission,
  type RoleFeatureKey,
} from '../types/roles.types';

const FEATURE_LABELS: Record<RoleFeatureKey, string> = {
  dashboard: 'Tableau de bord',
  documents: 'Documents',
  users: 'Utilisateurs',
  roles: 'Roles',
  badges: 'Badges',
  confidentiality: 'Confidentialite',
};

const OPERATIONS: Array<keyof Omit<FeaturePermission, 'feature'>> = [
  'canRead',
  'canEdit',
  'canDelete',
  'canSearch',
];

const OPERATION_LABELS: Record<(typeof OPERATIONS)[number], string> = {
  canRead: 'Lire',
  canEdit: 'Editer',
  canDelete: 'Supprimer',
  canSearch: 'Rechercher',
};

const defaultFeaturePermissions = (): FeaturePermission[] =>
  ROLE_FEATURE_KEYS.map((feature) => ({
    feature,
    canRead: false,
    canEdit: false,
    canDelete: false,
    canSearch: false,
  }));

const mergeFeaturePermissions = (items: FeaturePermission[] | undefined) => {
  const defaults = defaultFeaturePermissions();
  const map = new Map((items ?? []).map((item) => [item.feature, item]));
  return defaults.map((item) => map.get(item.feature) ?? item);
};

type FeaturePermissionsMatrixProps = {
  value: FeaturePermission[];
  onToggle: (feature: RoleFeatureKey, operation: keyof Omit<FeaturePermission, 'feature'>) => void;
  disabled?: boolean;
};

const FeaturePermissionsMatrix = ({
  value,
  onToggle,
  disabled = false,
}: FeaturePermissionsMatrixProps) => {
  const valueByFeature = new Map(value.map((item) => [item.feature, item]));

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#dde8f0]">
      <table className="min-w-full divide-y divide-[#dde8f0] text-sm">
        <thead className="bg-[#edf4f8]">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#456882]">
              Fonctionnalite
            </th>
            {OPERATIONS.map((operation) => (
              <th
                key={operation}
                className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-[#456882]"
              >
                {OPERATION_LABELS[operation]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#dde8f0] bg-white">
          {ROLE_FEATURE_KEYS.map((feature) => {
            const permission = valueByFeature.get(feature);

            return (
              <tr key={feature}>
                <td className="px-3 py-2 font-medium text-[#1B3C53]">{FEATURE_LABELS[feature]}</td>
                {OPERATIONS.map((operation) => {
                  const checked = permission?.[operation] ?? false;

                  return (
                    <td key={`${feature}-${operation}`} className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => onToggle(feature, operation)}
                        className="h-4 w-4 rounded border-[#c4d4df] text-[#234C6A] focus:ring-[#234C6A]"
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

type RoleDraft = {
  id: string;
  key: string;
  name: string;
  description: string;
  badgeIds: string[];
  confidentialityIds: string[];
  featurePermissions: FeaturePermission[];
};

const toDraft = (role: AppRole): RoleDraft => ({
  id: role.id,
  key: role.key,
  name: role.name,
  description: role.description ?? '',
  badgeIds: (role.badges ?? []).map((badge) => badge.id),
  confidentialityIds: (role.confidentialities ?? []).map((item) => item.id),
  featurePermissions: mergeFeaturePermissions(role.featurePermissions),
});

export const RolePermissionsPage = () => {
  const { user } = useAuthStore();
  const { canEditFeature, canDeleteFeature } = usePermissions();
  const { refreshPermissions } = useRefreshPermissions();
  const isAdmin = user?.role === 'admin';
  const canManageRoles = isAdmin || canEditFeature('roles');
  const canRemoveRoles = isAdmin || canDeleteFeature('roles');
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [allConfidentialities, setAllConfidentialities] = useState<Confidentiality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState<RoleDraft | null>(null);
  const [newRole, setNewRole] = useState({
    key: '',
    name: '',
    description: '',
    badgeIds: [] as string[],
    confidentialityIds: [] as string[],
    featurePermissions: defaultFeaturePermissions(),
  });

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === roleDraft?.id) ?? null,
    [roles, roleDraft?.id],
  );

  const isSavingModalRole = Boolean(roleDraft?.id && savingRoleId === roleDraft.id);

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

        if (!active) return;

        setRoles(rolesData);
        setAllBadges(badgesData);
        setAllConfidentialities(confidentialityData);
        setLoading(false);
      } catch {
        if (!active) return;
        setError('Impossible de charger la configuration des roles.');
        setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const closeRoleModal = useCallback(() => {
    if (isSavingModalRole) return;
    setIsModalOpen(false);
    setRoleDraft(null);
  }, [isSavingModalRole]);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRoleModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, closeRoleModal]);

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

  const toggleNewRoleFeatureOperation = (
    feature: RoleFeatureKey,
    operation: keyof Omit<FeaturePermission, 'feature'>,
  ) => {
    setNewRole((prev) => ({
      ...prev,
      featurePermissions: prev.featurePermissions.map((item) =>
        item.feature === feature
          ? { ...item, [operation]: !item[operation] }
          : item,
      ),
    }));
  };

  const createRole = async () => {
    const hasFeatureAccess = newRole.featurePermissions.some(
      (item) => item.canRead || item.canEdit || item.canDelete || item.canSearch,
    );

    if (
      !newRole.key.trim() ||
      !newRole.name.trim() ||
      newRole.badgeIds.length === 0 ||
      newRole.confidentialityIds.length === 0 ||
      !hasFeatureAccess
    ) {
      setError(
        'Renseignez key/nom, selectionnez badge/confidentialite et au moins une operation sur une fonctionnalite.',
      );
      return;
    }

    try {
      setError('');
      const created = await rolesService.create({
        key: newRole.key.trim(),
        name: newRole.name.trim(),
        description: newRole.description.trim() || undefined,
        badgeIds: newRole.badgeIds,
        confidentialityIds: newRole.confidentialityIds,
        featurePermissions: newRole.featurePermissions,
      });

      setRoles((prev) => [created, ...prev]);
      await refreshPermissions();
      setNewRole({
        key: '',
        name: '',
        description: '',
        badgeIds: [],
        confidentialityIds: [],
        featurePermissions: defaultFeaturePermissions(),
      });

      await Swal.fire({
        icon: 'success',
        title: 'Role cree',
        text: `Le role ${created.name} a ete cree avec succes.`,
        timer: 1300,
        showConfirmButton: false,
      });
    } catch {
      setError('Creation du role impossible.');
    }
  };

  const openRoleModal = async (role: AppRole) => {
    try {
      setError('');
      setSavingRoleId(role.id);

      const completeRole = await rolesService.getById(role.id);
      setRoles((prev) =>
        prev.map((item) => (item.id === completeRole.id ? completeRole : item)),
      );
      setRoleDraft(toDraft(completeRole));
      setIsModalOpen(true);
    } catch {
      setError("Impossible de charger le detail du role pour l'edition.");
    } finally {
      setSavingRoleId(null);
    }
  };

  const toggleDraftBadge = (badgeId: string) => {
    setRoleDraft((prev) => {
      if (!prev) return prev;
      const has = prev.badgeIds.includes(badgeId);
      return {
        ...prev,
        badgeIds: has
          ? prev.badgeIds.filter((id) => id !== badgeId)
          : [...prev.badgeIds, badgeId],
      };
    });
  };

  const toggleDraftConfidentiality = (confidentialityId: string) => {
    setRoleDraft((prev) => {
      if (!prev) return prev;
      const has = prev.confidentialityIds.includes(confidentialityId);
      return {
        ...prev,
        confidentialityIds: has
          ? prev.confidentialityIds.filter((id) => id !== confidentialityId)
          : [...prev.confidentialityIds, confidentialityId],
      };
    });
  };

  const toggleDraftFeatureOperation = (
    feature: RoleFeatureKey,
    operation: keyof Omit<FeaturePermission, 'feature'>,
  ) => {
    setRoleDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        featurePermissions: prev.featurePermissions.map((item) =>
          item.feature === feature
            ? { ...item, [operation]: !item[operation] }
            : item,
        ),
      };
    });
  };

  const saveRoleDetails = async () => {
    if (!roleDraft) return;

    const hasFeatureAccess = roleDraft.featurePermissions.some(
      (item) => item.canRead || item.canEdit || item.canDelete || item.canSearch,
    );

    if (
      !roleDraft.key.trim() ||
      !roleDraft.name.trim() ||
      roleDraft.badgeIds.length === 0 ||
      roleDraft.confidentialityIds.length === 0 ||
      !hasFeatureAccess
    ) {
      setError(
        'Un role doit avoir key/nom, badge/confidentialite et au moins une operation active.',
      );
      return;
    }

    try {
      setError('');
      setSavingRoleId(roleDraft.id);

      const updated = await rolesService.update(roleDraft.id, {
        key: roleDraft.key.trim(),
        name: roleDraft.name.trim(),
        description: roleDraft.description.trim() || undefined,
        badgeIds: roleDraft.badgeIds,
        confidentialityIds: roleDraft.confidentialityIds,
        featurePermissions: roleDraft.featurePermissions,
      });

      setRoles((prev) => prev.map((role) => (role.id === updated.id ? updated : role)));
      await refreshPermissions();
      setIsModalOpen(false);
      setRoleDraft(null);

      await Swal.fire({
        icon: 'success',
        title: 'Mise a jour reussie',
        text: `Le role ${updated.name} a ete mis a jour.`,
        timer: 1300,
        showConfirmButton: false,
      });
    } catch {
      setError('Mise a jour du role impossible.');
    } finally {
      setSavingRoleId(null);
    }
  };

  const deleteRole = async (role: AppRole) => {
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer le role ${role.name} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#BD114A',
      cancelButtonColor: '#456882',
    });

    if (!result.isConfirmed) return;

    try {
      setSavingRoleId(role.id);
      await rolesService.remove(role.id);
      setRoles((prev) => prev.filter((item) => item.id !== role.id));
      await refreshPermissions();

      await Swal.fire({
        icon: 'success',
        title: 'Role supprime',
        timer: 1100,
        showConfirmButton: false,
      });
    } catch {
      setError('Suppression du role impossible (utilise ou role systeme).');
      await Swal.fire({
        icon: 'error',
        title: 'Suppression impossible',
        text: 'Ce role est probablement utilise ou protege.',
      });
    } finally {
      setSavingRoleId(null);
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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="arch-hero overflow-hidden rounded-3xl px-8 py-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-white">Roles & Permissions</h1>
        <p className="mt-1 text-sm text-[#a8c8de]">
          Gere la liste des roles puis modifie leurs details dans une fenetre dediee.
        </p>
      </div>

      <div className="arch-panel rounded-3xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7aaac4]" />
            <Input
              placeholder="Rechercher par nom ou cle..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void searchRoles();
              }}
              className="pl-10"
            />
          </div>
          <Button type="button" variant="secondary" onClick={() => void searchRoles()}>
            <RiSearchLine className="h-4 w-4" /> Rechercher
          </Button>
        </div>
      </div>

       {error && (
         <div className="rounded-2xl border border-[#f4a8bf] bg-[#fce8ef] px-4 py-3 text-sm text-[#BD114A]">
           {error}
         </div>
       )}

       {canManageRoles && (
         <div className="arch-card rounded-3xl p-6">
           <div className="mb-5 flex items-center justify-between gap-3">
             <h2 className="text-base font-semibold text-[#1B3C53]">Creer un role</h2>
             <span className="rounded-full bg-[#dbeaf3] px-3 py-1 text-xs font-medium text-[#234C6A]">
               {roles.length} role(s)
             </span>
           </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder="Nom du role"
            value={newRole.name}
            onChange={(event) => setNewRole((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            placeholder="Cle (ex: auditeur)"
            value={newRole.key}
            onChange={(event) => setNewRole((prev) => ({ ...prev, key: event.target.value }))}
          />
          <Input
            placeholder="Description (optionnel)"
            value={newRole.description}
            onChange={(event) =>
              setNewRole((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#456882]">
              Badges autorises
            </p>
            <div className="flex flex-wrap gap-2">
              {allBadges.map((badge) => {
                const checked = newRole.badgeIds.includes(badge.id);
                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => toggleNewRoleBadge(badge.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      checked
                        ? 'border-[#a8c8de] bg-[#dbeaf3] text-[#234C6A]'
                        : 'border-[#c4d4df] bg-[#edf4f8] text-[#456882] hover:border-[#7aaac4] hover:text-[#1B3C53]'
                    }`}
                  >
                    {checked ? '✓ ' : ''}
                    {badge.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#456882]">
              Confidentialites autorisees
            </p>
            <div className="flex flex-wrap gap-2">
              {allConfidentialities.map((item) => {
                const checked = newRole.confidentialityIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleNewRoleConfidentiality(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      checked
                        ? 'border-[#9fd8c8] bg-[#d4f0e8] text-[#237a63]'
                        : 'border-[#c4d4df] bg-[#edf4f8] text-[#456882] hover:border-[#7aaac4] hover:text-[#1B3C53]'
                    }`}
                  >
                    {checked ? '✓ ' : ''}
                    {item.level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#456882]">
            Permissions par fonctionnalite
          </p>
          <FeaturePermissionsMatrix
            value={newRole.featurePermissions}
            onToggle={toggleNewRoleFeatureOperation}
          />
        </div>

         <div className="mt-5">
           <Button onClick={() => void createRole()}>
             <RiAddLine className="h-4 w-4" /> Creer le role
           </Button>
         </div>
       </div>
       )}

      {loading ? (
        <div className="arch-card rounded-3xl py-16">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#234C6A] border-t-transparent" />
          </div>
          <p className="mt-3 text-center text-sm text-[#456882]">Chargement des roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#c4d4df] bg-[#edf4f8] px-6 py-14 text-center shadow-sm">
          <p className="text-sm text-[#456882]">Aucun role trouve pour cette recherche.</p>
        </div>
      ) : (
        <div className="arch-card overflow-hidden rounded-3xl">
          <div className="grid grid-cols-12 border-b border-[#dde8f0] bg-[#edf4f8] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#456882]">
            <div className="col-span-5">Role</div>
            <div className="col-span-2">Badges</div>
            <div className="col-span-2">Confidentialites</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {roles.map((role) => (
            <div
              key={role.id}
              className="grid grid-cols-12 items-center gap-2 border-b border-[#dde8f0] px-5 py-4 transition-colors last:border-b-0 hover:bg-[#f4f7fa]"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#dbeaf3] text-sm font-bold text-[#234C6A]">
                  {role.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#1B3C53]">{role.name}</p>
                  <p className="text-xs text-[#456882]">
                    cle: <code className="rounded bg-[#edf4f8] px-1 text-[#456882]">{role.key}</code>
                  </p>
                </div>
              </div>

              <div className="col-span-2">
                <span className="rounded-full bg-[#dbeaf3] px-2.5 py-1 text-xs font-medium text-[#234C6A]">
                  {(role.badges ?? []).length}
                </span>
              </div>

              <div className="col-span-2">
                <span className="rounded-full bg-[#d4f0e8] px-2.5 py-1 text-xs font-medium text-[#237a63]">
                  {(role.confidentialities ?? []).length}
                </span>
              </div>

               <div className="col-span-3 flex justify-end gap-1.5">
                  {canManageRoles && (
                   <IconButton
                     icon={<RiPencilLine className="h-3.5 w-3.5" />}
                     label="Modifier le role"
                     variant="default"
                     size="sm"
                      onClick={() => void openRoleModal(role)}
                     isLoading={savingRoleId === role.id}
                   />
                 )}
                  {canRemoveRoles && (
                   <IconButton
                     icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
                     label="Supprimer le role"
                     variant="danger"
                     size="sm"
                     onClick={() => void deleteRole(role)}
                     isLoading={savingRoleId === role.id}
                   />
                 )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && roleDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeRoleModal();
          }}
          role="presentation"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-[#dde8f0]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1B3C53]">Detail du role</h2>
                <p className="mt-1 text-sm text-[#456882]">
                  Modifiez les informations et permissions du role selectionne.
                </p>
              </div>
              <IconButton
                icon={<RiCloseLine className="h-4 w-4" />}
                label="Fermer"
                variant="default"
                size="md"
                onClick={closeRoleModal}
                disabled={isSavingModalRole}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Nom du role"
                value={roleDraft.name}
                disabled={isSavingModalRole}
                onChange={(event) =>
                  setRoleDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                }
              />
              <Input
                placeholder="Cle du role"
                value={roleDraft.key}
                disabled={isSavingModalRole}
                onChange={(event) =>
                  setRoleDraft((prev) => (prev ? { ...prev, key: event.target.value } : prev))
                }
              />
              <Input
                placeholder="Description"
                value={roleDraft.description}
                disabled={isSavingModalRole}
                onChange={(event) =>
                  setRoleDraft((prev) =>
                    prev ? { ...prev, description: event.target.value } : prev,
                  )
                }
              />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#456882]">
                  Badges autorises
                </p>
                <div className="flex flex-wrap gap-2">
                  {allBadges.map((badge) => {
                    const checked = roleDraft.badgeIds.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => toggleDraftBadge(badge.id)}
                        disabled={isSavingModalRole}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                          checked
                            ? 'border-[#a8c8de] bg-[#dbeaf3] text-[#234C6A]'
                            : 'border-[#c4d4df] bg-[#edf4f8] text-[#456882] hover:border-[#7aaac4] hover:text-[#1B3C53]'
                        }`}
                      >
                        {checked ? '✓ ' : ''}
                        {badge.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#456882]">
                  Confidentialites autorisees
                </p>
                <div className="flex flex-wrap gap-2">
                  {allConfidentialities.map((item) => {
                    const checked = roleDraft.confidentialityIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleDraftConfidentiality(item.id)}
                        disabled={isSavingModalRole}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                          checked
                            ? 'border-[#9fd8c8] bg-[#d4f0e8] text-[#237a63]'
                            : 'border-[#c4d4df] bg-[#edf4f8] text-[#456882] hover:border-[#7aaac4] hover:text-[#1B3C53]'
                        }`}
                      >
                        {checked ? '✓ ' : ''}
                        {item.level}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#456882]">
                Permissions par fonctionnalite
              </p>
              <FeaturePermissionsMatrix
                value={roleDraft.featurePermissions}
                onToggle={toggleDraftFeatureOperation}
                disabled={isSavingModalRole}
              />
            </div>

            {selectedRole?.description && (
              <div className="mt-5 rounded-xl border border-[#c4d4df] bg-[#edf4f8] px-4 py-3 text-sm text-[#456882]">
                <div className="mb-1 inline-flex items-center gap-2 font-medium">
                  <RiShieldCheckLine className="h-4 w-4" /> Description actuelle
                </div>
                <p>{selectedRole.description}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closeRoleModal}
                disabled={isSavingModalRole}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={() => void saveRoleDetails()}
                isLoading={isSavingModalRole}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

