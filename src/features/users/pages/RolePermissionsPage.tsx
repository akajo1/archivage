import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiPencilLine,
  RiSearchLine,
  RiShieldCheckLine,
} from 'react-icons/ri';
import Swal from 'sweetalert2';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { badgeService } from '../../badges/services/badgeService';
import { confidentialityService } from '../../confidentiality/services/confidentialityService';
import { rolesService } from '../services/rolesService';
import type { AppRole } from '../types/roles.types';

type RoleDraft = {
  id: string;
  key: string;
  name: string;
  description: string;
  badgeIds: string[];
  confidentialityIds: string[];
};

const toDraft = (role: AppRole): RoleDraft => ({
  id: role.id,
  key: role.key,
  name: role.name,
  description: role.description ?? '',
  badgeIds: (role.badges ?? []).map((badge) => badge.id),
  confidentialityIds: (role.confidentialities ?? []).map((item) => item.id),
});

export const RolePermissionsPage = () => {
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

  const createRole = async () => {
    if (
      !newRole.key.trim() ||
      !newRole.name.trim() ||
      newRole.badgeIds.length === 0 ||
      newRole.confidentialityIds.length === 0
    ) {
      setError(
        'Renseignez key/nom et selectionnez au moins un badge et une confidentialite.',
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
      });

      setRoles((prev) => [created, ...prev]);
      setNewRole({
        key: '',
        name: '',
        description: '',
        badgeIds: [],
        confidentialityIds: [],
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

  const openRoleModal = (role: AppRole) => {
    setError('');
    setRoleDraft(toDraft(role));
    setIsModalOpen(true);
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

  const saveRoleDetails = async () => {
    if (!roleDraft) return;

    if (
      !roleDraft.key.trim() ||
      !roleDraft.name.trim() ||
      roleDraft.badgeIds.length === 0 ||
      roleDraft.confidentialityIds.length === 0
    ) {
      setError(
        'Un role doit avoir une key, un nom, au moins un badge et une confidentialite.',
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
      });

      setRoles((prev) => prev.map((role) => (role.id === updated.id ? updated : role)));
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
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    try {
      setSavingRoleId(role.id);
      await rolesService.remove(role.id);
      setRoles((prev) => prev.filter((item) => item.id !== role.id));

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
        <h1 className="text-3xl font-bold tracking-tight text-[#2f2a24]">Roles & Permissions</h1>
        <p className="mt-1 text-sm text-[#6f614e]">
          Gere la liste des roles puis modifie leurs details dans une fenetre dediee.
        </p>
      </div>

      <div className="arch-panel rounded-3xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7f6b]" />
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
        <div className="rounded-2xl border border-[#d7a59c] bg-[#f3d8d2] px-4 py-3 text-sm text-[#8b3e34]">
          {error}
        </div>
      )}

      <div className="arch-card rounded-3xl p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#4f3f2f]">Creer un role</h2>
          <span className="rounded-full bg-[#eadbc4] px-3 py-1 text-xs font-medium text-[#6f563a]">
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8f7f6a]">
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
                        ? 'border-[#c8b089] bg-[#eadbc4] text-[#6f563a]'
                        : 'border-[#dccdb8] bg-[#f7f0e3] text-[#7d6c58] hover:border-[#ccb997] hover:text-[#5d4c39]'
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8f7f6a]">
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
                        ? 'border-[#b9cbbf] bg-[#dce8e2] text-[#355246]'
                        : 'border-[#dccdb8] bg-[#f7f0e3] text-[#7d6c58] hover:border-[#ccb997] hover:text-[#5d4c39]'
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
          <Button onClick={() => void createRole()}>
            <RiAddLine className="h-4 w-4" /> Creer le role
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="arch-card rounded-3xl py-16">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#806444] border-t-transparent" />
          </div>
          <p className="mt-3 text-center text-sm text-[#8f7f6a]">Chargement des roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#ccb997] bg-[#fdf8ef] px-6 py-14 text-center shadow-sm">
          <p className="text-sm text-[#8f7f6a]">Aucun role trouve pour cette recherche.</p>
        </div>
      ) : (
        <div className="arch-card overflow-hidden rounded-3xl">
          <div className="grid grid-cols-12 border-b border-[#e2d5c0] bg-[#f5eddf] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8f7f6a]">
            <div className="col-span-5">Role</div>
            <div className="col-span-2">Badges</div>
            <div className="col-span-2">Confidentialites</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {roles.map((role) => (
            <div
              key={role.id}
              className="grid grid-cols-12 items-center gap-2 border-b border-[#e2d5c0] px-5 py-4 transition-colors last:border-b-0 hover:bg-[#f2e7d6]/60"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e7d8c2] text-sm font-bold text-[#6f563a]">
                  {role.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#2f2a24]">{role.name}</p>
                  <p className="text-xs text-[#8f7f6a]">
                    cle: <code className="rounded bg-[#f0e5d4] px-1 text-[#6c583f]">{role.key}</code>
                  </p>
                </div>
              </div>

              <div className="col-span-2">
                <span className="rounded-full bg-[#eadbc4] px-2.5 py-1 text-xs font-medium text-[#6f563a]">
                  {(role.badges ?? []).length}
                </span>
              </div>

              <div className="col-span-2">
                <span className="rounded-full bg-[#dce8e2] px-2.5 py-1 text-xs font-medium text-[#355246]">
                  {(role.confidentialities ?? []).length}
                </span>
              </div>

              <div className="col-span-3 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openRoleModal(role)}
                  isLoading={savingRoleId === role.id}
                >
                  <RiPencilLine className="h-3.5 w-3.5" /> Modifier
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => void deleteRole(role)}
                  isLoading={savingRoleId === role.id}
                >
                  <RiDeleteBinLine className="h-3.5 w-3.5" /> Supprimer
                </Button>
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
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#fffaf2] p-6 shadow-2xl border border-[#d8cab3]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#2f2a24]">Detail du role</h2>
                <p className="mt-1 text-sm text-[#6f614e]">
                  Modifiez les informations et permissions du role selectionne.
                </p>
              </div>
              <button
                type="button"
                onClick={closeRoleModal}
                disabled={isSavingModalRole}
                className="rounded-lg border border-[#d8cab3] px-2 py-1 text-sm text-[#6f614e] hover:bg-[#f2e7d6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Fermer
              </button>
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
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8f7f6a]">
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
                            ? 'border-[#c8b089] bg-[#eadbc4] text-[#6f563a]'
                            : 'border-[#dccdb8] bg-[#f7f0e3] text-[#7d6c58] hover:border-[#ccb997] hover:text-[#5d4c39]'
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
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8f7f6a]">
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
                            ? 'border-[#b9cbbf] bg-[#dce8e2] text-[#355246]'
                            : 'border-[#dccdb8] bg-[#f7f0e3] text-[#7d6c58] hover:border-[#ccb997] hover:text-[#5d4c39]'
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

            {selectedRole?.description && (
              <div className="mt-5 rounded-xl border border-[#d5c3a7] bg-[#f3e8d5] px-4 py-3 text-sm text-[#6f563a]">
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

