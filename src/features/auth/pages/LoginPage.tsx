import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginPayload } from '../types/auth.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { FormField } from '../../../shared/components/molecules/FormField';
import { useState } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginPayload>();

  const onSubmit = async (data: LoginPayload) => {
    try {
      setApiError('');
      const res = await authService.login(data);
      setAuth(res.user, res.access_token);
      navigate('/documents');
    } catch {
      setApiError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-linear-to-br from-[#1B3C53] via-[#234C6A] to-[#2d5a7b] p-12 text-white">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>📁</span>
          <span>Archivage</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Retrouvez tous vos documents en un seul endroit.</h2>
          <p className="mt-4 text-base leading-relaxed text-[#a8c8de]">Organisez, partagez et gerez vos archives documentaires avec controle d'acces par role.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 opacity-30">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`rounded-2xl bg-white/20 ${i % 3 === 0 ? 'h-24' : i % 3 === 1 ? 'h-32' : 'h-20'}`} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-transparent p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <span className="text-4xl">📁</span>
            <h1 className="mt-2 text-2xl font-bold text-[#1B3C53]">Archivage</h1>
          </div>

          <div className="arch-card rounded-3xl p-8">
            <h2 className="mb-1 text-2xl font-bold text-[#1B3C53]">Connexion</h2>
            <p className="mb-6 text-sm text-[#456882]">Bienvenue ! Entrez vos identifiants.</p>

            {apiError && (
              <div className="mb-4 rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  {...register('password', { required: 'Le mot de passe est requis' })}
                  error={errors.password?.message}
                />
              </FormField>

              <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
                Se connecter
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#456882]">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-medium text-[#234C6A] hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
