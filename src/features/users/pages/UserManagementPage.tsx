import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Role } from '../../auth/types/auth.types';
import type { ManagedUser, CreateManagedUserPayload } from '../types/userManagement.types';
import { userManagementService } from '../services/userManagementService';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';

const roles: Role[] = ['user', 'manager', 'admin'];

export const UserManagementPage = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
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
        const data = await userManagementService.getAll();
        if (active) {
          setUsers(data);
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
    if (!confirm('Supprimer cet utilisateur ?')) return;

    try {
      await userManagementService.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError('Suppression impossible.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="mt-1 text-sm text-gray-500">Administrer les comptes et les niveaux d'acces.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Creer un utilisateur</h2>
        <form onSubmit={handleSubmit(onCreate)} className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Nom" {...register('name', { required: true })} />
          <Input placeholder="Email" type="email" {...register('email', { required: true })} />
          <Input placeholder="Mot de passe" type="password" {...register('password', { required: true, minLength: 6 })} />
          <select
            {...register('role', { required: true })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <div className="md:col-span-4">
            <Button type="submit" isLoading={isSubmitting}>Ajouter</Button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Cree le</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={5}>
                  Chargement...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={5}>
                  Aucun utilisateur.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => void onRoleChange(user.id, e.target.value as Role)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="danger" onClick={() => void onDelete(user.id)}>
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

