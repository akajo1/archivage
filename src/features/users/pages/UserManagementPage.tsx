import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import {
  RiUserAddLine,
  RiDeleteBinLine,
  RiTeamLine,
  RiCloseLine,
  RiRefreshLine,
  RiFileCopyLine,
} from 'react-icons/ri';
import type { Role } from '../../auth/types/auth.types';
import type { ManagedUser, CreateManagedUserPayload } from '../types/userManagement.types';
import { userManagementService } from '../services/userManagementService';
import { rolesService } from '../services/rolesService';
import { usePermissions, useRefreshPermissions } from '../../auth/hooks/usePermissions';
import { Button } from '../../../shared/components/atoms/Button';
import { IconButton } from '../../../shared/components/atoms/IconButton';
import { Input } from '../../../shared/components/atoms/Input';

export const UserManagementPage = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<Role[]>(['user']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [temporaryPasswords, setTemporaryPasswords] = useState<Record<string, string>>({});
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const { canCreateFeature, canEditFeature, canDeleteFeature } = usePermissions();
  const { refreshPermissions } = useRefreshPermissions();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<CreateManagedUserPayload>({
    defaultValues: { role: 'user' },
  });

  const generatePassword = () => {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 12; i += 1) {
      generated += chars[Math.floor(Math.random() * chars.length)];
    }
    setValue('password', generated, { shouldDirty: true, shouldValidate: true });
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [data, roleData] = await Promise.all([
          userManagementService.getAll(),
          rolesService.getAll(),
        ]);
        if (active) {
          setUsers(data);
          setRoles(roleData.map((role) => role.key));
          setLoading(false);
        }
      } catch {
        if (active) {
          setError('Impossible de charger les utilisateurs.');
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const onCreate = async (payload: CreateManagedUserPayload) => {
    try {
      setError('');
      const created = await userManagementService.create(payload);
      setUsers((prev) => [created, ...prev]);
      if (created.temporaryPassword) {
        setTemporaryPasswords((prev) => ({
          ...prev,
          [created.id]: created.temporaryPassword as string,
        }));
      }
      reset({ role: 'user', name: '', email: '', password: '' });
      setIsCreateModalOpen(false);

      await Swal.fire({
        icon: 'success',
        title: 'Utilisateur cree',
        html: created.temporaryPassword
          ? `Mot de passe temporaire : <strong>${created.temporaryPassword}</strong>`
          : 'Le compte a ete cree avec succes.',
      });
    } catch {
      setError('Creation impossible. Verifiez email/role.');
    }
  };

  const closeCreateModal = useCallback(() => {
    if (isSubmitting) return;
    setIsCreateModalOpen(false);
  }, [isSubmitting]);

  useEffect(() => {
    if (!isCreateModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCreateModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCreateModalOpen, closeCreateModal]);

  const onRoleChange = async (id: string, role: Role) => {
    try {
      const updated = await userManagementService.update(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      await refreshPermissions();
    } catch {
      setError('Mise a jour du role impossible.');
    }
  };

  const copyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      await Swal.fire({
        icon: 'success',
        title: 'Copie',
        text: 'Le mot de passe temporaire a ete copie.',
        timer: 1000,
        showConfirmButton: false,
      });
    } catch {
      setError('Impossible de copier le mot de passe.');
    }
  };

  const onAdminResetPassword = async (user: ManagedUser) => {
    try {
      setError('');
      setResettingUserId(user.id);
      const updated = await userManagementService.adminResetPassword(user.id);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
      if (updated.temporaryPassword) {
        setTemporaryPasswords((prev) => ({
          ...prev,
          [user.id]: updated.temporaryPassword as string,
        }));
      }

      await Swal.fire({
        icon: 'success',
        title: 'Mot de passe reinitialise',
        html: updated.temporaryPassword
          ? `Nouveau mot de passe temporaire : <strong>${updated.temporaryPassword}</strong>`
          : 'Le mot de passe a ete reinitialise.',
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error?.response?.data?.message ?? 'Reinitialisation impossible.',
      );
    } finally {
      setResettingUserId(null);
    }
  };

   const onDelete = async (id: string) => {
     const result = await Swal.fire({
       title: 'Supprimer cet utilisateur ?',
       text: 'Cette action est irréversible.',
       icon: 'warning',
       showCancelButton: true,
       confirmButtonText: 'Oui, supprimer',
       cancelButtonText: 'Annuler',
       confirmButtonColor: '#BD114A',
       cancelButtonColor: '#456882',
     });
     if (!result.isConfirmed) return;

     try {
       await userManagementService.remove(id);
       setUsers((prev) => prev.filter((u) => u.id !== id));
       void Swal.fire({ title: 'Supprimé !', icon: 'success', timer: 1500, showConfirmButton: false });
     } catch {
       setError('Suppression impossible.');
     }
   };

   const canCreate = canCreateFeature('users');
   const canEdit = canEditFeature('users');
   const canDelete = canDeleteFeature('users');

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="arch-hero overflow-hidden rounded-3xl px-8 py-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-white">Utilisateurs</h1>
        <p className="mt-1 text-sm text-[#a8c8de]">Administrez les comptes et les niveaux d'acces.</p>
      </div>

      <div className="arch-panel rounded-3xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#456882]">{users.length} utilisateur(s)</p>
          {canCreate && (
            <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
              <RiUserAddLine className="h-4 w-4" /> Ajouter un utilisateur
            </Button>
          )}
        </div>
      </div>

       {error && (
         <div className="rounded-2xl border border-[#f4a8bf] bg-[#fce8ef] px-4 py-3 text-sm text-[#BD114A]">
           {error}
         </div>
       )}

      {isCreateModalOpen && canCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeCreateModal();
          }}
          role="presentation"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#dde8f0] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#dde8f0] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#1B3C53]">Ajouter un utilisateur</h2>
                <p className="mt-1 text-sm text-[#456882]">Creez un compte, assignez un role et partagez le mot de passe initial.</p>
              </div>
              <IconButton
                icon={<RiCloseLine className="h-4 w-4" />}
                label="Fermer"
                variant="default"
                size="md"
                onClick={closeCreateModal}
                disabled={isSubmitting}
              />
            </div>

            <form onSubmit={handleSubmit(onCreate)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#456882]">
                    Nom complet
                  </label>
                  <Input
                    placeholder="Ex: Marie Dubois"
                    disabled={isSubmitting}
                    {...register('name', { required: true })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#456882]">
                    Email
                  </label>
                  <Input
                    placeholder="Ex: marie@entreprise.fr"
                    type="email"
                    disabled={isSubmitting}
                    {...register('email', { required: true })}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#dde8f0] bg-[#f4f7fa] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1B3C53]">Mot de passe initial</p>
                    <p className="text-xs text-[#456882]">L'utilisateur devra le changer a sa premiere connexion.</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generatePassword}
                    disabled={isSubmitting}
                  >
                    Generer
                  </Button>
                </div>

                <Input
                  placeholder="Mot de passe"
                  type="text"
                  disabled={isSubmitting}
                  {...register('password', { required: true, minLength: 6 })}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#456882]">
                  Role
                </label>
                <select
                  {...register('role', { required: true })}
                  disabled={isSubmitting}
                  className="arch-select w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#dde8f0] pt-4">
                <Button type="button" variant="secondary" onClick={closeCreateModal} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  <RiUserAddLine className="h-4 w-4" /> Ajouter l'utilisateur
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="arch-card overflow-hidden rounded-3xl">
        <div className="border-b border-[#dde8f0] px-6 py-4">
          <p className="text-sm font-semibold text-[#1B3C53]">{users.length} utilisateur(s)</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#234C6A] border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dbeaf3] text-[#234C6A]">
              <RiTeamLine className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-medium text-[#456882]">Aucun utilisateur</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#dde8f0]">
            {users.map((user) => {
              const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <li key={user.id} className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-[#f4f7fa]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbeaf3] text-xs font-bold text-[#234C6A]">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1B3C53]">{user.name}</p>
                    <p className="truncate text-xs text-[#456882]">{user.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {user.passwordResetRequestedAt && (
                        <span className="rounded-full bg-[#fff2d6] px-2.5 py-1 text-[11px] font-medium text-[#b26b00]">
                          Demande de reinitialisation
                        </span>
                      )}
                      {user.mustChangePassword && (
                        <span className="rounded-full bg-[#ece7ff] px-2.5 py-1 text-[11px] font-medium text-[#5d4baf]">
                          Changement de mot de passe requis
                        </span>
                      )}
                    </div>
                    {temporaryPasswords[user.id] && (
                      <div className="mt-3 rounded-2xl border border-[#dde8f0] bg-[#f4f7fa] px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#456882]">
                              Mot de passe temporaire
                            </p>
                            <p className="mt-1 font-mono text-sm text-[#1B3C53]">
                              {temporaryPasswords[user.id]}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void copyPassword(temporaryPasswords[user.id])}
                          >
                            <RiFileCopyLine className="h-3.5 w-3.5" /> Copier
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="hidden text-xs text-[#456882] sm:block">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>

                   <select
                     value={user.role}
                     onChange={(e) => void onRoleChange(user.id, e.target.value as Role)}
                      disabled={!canEdit}
                     className="arch-select rounded-full px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                   >
                     {roles.map((role) => (
                       <option key={role} value={role}>{role}</option>
                     ))}
                   </select>

                   <div className="flex items-center gap-1.5">
                     {canEdit && user.passwordResetRequestedAt && (
                       <IconButton
                         icon={<RiRefreshLine className="h-3.5 w-3.5" />}
                         label="Reinitialiser le mot de passe"
                         variant="success"
                         onClick={() => void onAdminResetPassword(user)}
                         isLoading={resettingUserId === user.id}
                       />
                     )}
                     {canDelete && (
                       <IconButton
                         icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
                         label="Supprimer l'utilisateur"
                         variant="danger"
                         onClick={() => void onDelete(user.id)}
                       />
                     )}
                   </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

