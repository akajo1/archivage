import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { RiUserAddLine, RiDeleteBinLine, RiTeamLine } from 'react-icons/ri';
import type { Role } from '../../auth/types/auth.types';
import type { ManagedUser, CreateManagedUserPayload } from '../types/userManagement.types';
import { userManagementService } from '../services/userManagementService';
import { rolesService } from '../services/rolesService';
import { Button } from '../../../shared/components/atoms/Button';
import { IconButton } from '../../../shared/components/atoms/IconButton';
import { Input } from '../../../shared/components/atoms/Input';

export const UserManagementPage = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<Role[]>(['user']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateManagedUserPayload>({
    defaultValues: { role: 'user' },
  });

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
      reset({ role: 'user', name: '', email: '', password: '' });
    } catch {
      setError('Creation impossible. Verifiez email/role.');
    }
  };

  const onRoleChange = async (id: string, role: Role) => {
    try {
      const updated = await userManagementService.update(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch {
      setError('Mise a jour du role impossible.');
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

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="arch-hero overflow-hidden rounded-3xl px-8 py-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-white">Utilisateurs</h1>
        <p className="mt-1 text-sm text-[#a8c8de]">Administrez les comptes et les niveaux d'acces.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#f4a8bf] bg-[#fce8ef] px-4 py-3 text-sm text-[#BD114A]">
          {error}
        </div>
      )}

      <div className="arch-card rounded-3xl p-6">
        <h2 className="mb-5 text-base font-semibold text-[#1B3C53]">Creer un utilisateur</h2>
        <form onSubmit={handleSubmit(onCreate)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Nom complet" {...register('name', { required: true })} />
          <Input placeholder="Email" type="email" {...register('email', { required: true })} />
          <Input placeholder="Mot de passe" type="password" {...register('password', { required: true, minLength: 6 })} />
          <select
            {...register('role', { required: true })}
            className="arch-select rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
          >
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit" isLoading={isSubmitting}>
              <RiUserAddLine className="h-4 w-4" /> Ajouter l'utilisateur
            </Button>
          </div>
        </form>
      </div>

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
                <li key={user.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#f4f7fa]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbeaf3] text-xs font-bold text-[#234C6A]">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1B3C53]">{user.name}</p>
                    <p className="truncate text-xs text-[#456882]">{user.email}</p>
                  </div>

                  <span className="hidden text-xs text-[#456882] sm:block">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>

                  <select
                    value={user.role}
                    onChange={(e) => void onRoleChange(user.id, e.target.value as Role)}
                    className="arch-select rounded-full px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>

                  <IconButton
                    icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
                    label="Supprimer l'utilisateur"
                    variant="danger"
                    onClick={() => void onDelete(user.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

