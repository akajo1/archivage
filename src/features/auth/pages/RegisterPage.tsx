import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { RegisterPayload } from '../types/auth.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { FormField } from '../../../shared/components/molecules/FormField';
import { useState } from 'react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterPayload>();

  const onSubmit = async (data: RegisterPayload) => {
    try {
      setApiError('');
      const res = await authService.register(data);
      setAuth(res.user, res.access_token);
      navigate('/documents');
    } catch {
      setApiError('Une erreur est survenue. Verifiez vos informations.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-linear-to-br from-[#5c4a34] via-[#745a3e] to-[#8c6e49] p-12 text-amber-50">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>📁</span>
          <span>Archivage</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Rejoignez l'espace documentaire.</h2>
          <p className="mt-4 text-base leading-relaxed text-amber-100/85">Creez votre compte pour acceder, archiver et partager vos documents en toute securite.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 opacity-40">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`rounded-2xl bg-amber-50/20 ${i % 3 === 0 ? 'h-20' : i % 3 === 1 ? 'h-28' : 'h-24'}`} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-transparent p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <span className="text-4xl">📁</span>
            <h1 className="mt-2 text-2xl font-bold text-[#2f2a24]">Archivage</h1>
          </div>

          <div className="arch-card rounded-3xl p-8">
            <h2 className="mb-1 text-2xl font-bold text-[#2f2a24]">Inscription</h2>
            <p className="mb-6 text-sm text-[#7a6c59]">Creez votre compte en quelques secondes.</p>

            {apiError && (
              <div className="mb-4 rounded-xl border border-[#d7a59c] bg-[#f3d8d2] p-3 text-sm text-[#8b3e34]">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Nom complet" htmlFor="name" required error={errors.name?.message}>
                <Input
                  id="name"
                  placeholder="Jean Dupont"
                  {...register('name', { required: 'Le nom est requis' })}
                  error={errors.name?.message}
                />
              </FormField>

              <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  {...register('email', { required: "L'email est requis" })}
                  error={errors.email?.message}
                />
              </FormField>

              <FormField label="Mot de passe" htmlFor="password" required error={errors.password?.message}>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: { value: 6, message: 'Minimum 6 caracteres' },
                  })}
                  error={errors.password?.message}
                />
              </FormField>

              <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
                Creer mon compte
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#7a6c59]">
              Deja un compte ?{' '}
              <Link to="/login" className="font-medium text-[#7a5e3d] hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
