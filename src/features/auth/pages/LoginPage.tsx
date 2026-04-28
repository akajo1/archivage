import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { RiCheckLine, RiLockPasswordLine, RiMailLine } from 'react-icons/ri';
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
      setAuth(res.user, res.access_token, res.refresh_token);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (
        isAxiosError(err) &&
        err.response?.data?.code === 'FIRST_LOGIN_PASSWORD_CHANGE_REQUIRED'
      ) {
        navigate('/first-login-change-password', {
          state: { email: data.email },
        });
        return;
      }
      setApiError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-linear-to-br from-[#1B3C53] via-[#234C6A] to-[#2d5a7b] p-12 text-white">
        <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 ring-1 ring-white/20">
          <span className="text-xl">📁</span>
          <span className="text-xl font-bold tracking-tight">Archivage</span>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Retrouvez tous vos documents en un seul endroit.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-[#a8c8de]">
            Organisez, partagez et suivez vos archives documentaires avec un
            controle d'acces par role, des niveaux de confidentialite et un
            journal complet d'activite.
          </p>

          <div className="grid max-w-xl gap-3 sm:grid-cols-2">
            <FeatureChip label="Recherche instantanee" />
            <FeatureChip label="Permissions avancees" />
            <FeatureChip label="Historique des actions" />
            <FeatureChip label="Export des donnees" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MetricCard value="100%" label="Traçabilite" />
          <MetricCard value="24/7" label="Disponibilite" />
          <MetricCard value="Role" label="Securite" />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-transparent p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <span className="text-4xl">📁</span>
            <h1 className="mt-2 text-2xl font-bold text-[#1B3C53]">Archivage</h1>
          </div>

          <div className="arch-card rounded-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-2xl font-bold text-[#1B3C53]">Connexion</h2>
                <p className="text-sm text-[#456882]">Bienvenue ! Entrez vos identifiants.</p>
              </div>
              <span className="rounded-full bg-[#dbeaf3] px-3 py-1 text-xs font-semibold text-[#234C6A]">
                Espace securise
              </span>
            </div>

            {apiError && (
              <div className="mb-4 rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
                <div className="relative">
                  <RiMailLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7aaac4]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    {...register('email', { required: "L'email est requis" })}
                    error={errors.email?.message}
                    className="pl-9"
                  />
                </div>
              </FormField>

              <FormField label="Mot de passe" htmlFor="password" required error={errors.password?.message}>
                <div className="relative">
                  <RiLockPasswordLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7aaac4]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password', { required: 'Le mot de passe est requis' })}
                    error={errors.password?.message}
                    className="pl-9"
                  />
                </div>
              </FormField>

              <div className="flex justify-end -mt-2">
                <Link to="/forgot-password" className="text-sm font-medium text-[#234C6A] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
                Se connecter
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#456882]">
              Contactez un administrateur pour créer un compte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureChip = ({ label }: { label: string }) => (
  <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/90 ring-1 ring-white/15">
    <RiCheckLine className="h-4 w-4 text-[#5ecbaf]" />
    <span>{label}</span>
  </div>
);

const MetricCard = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15">
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-xs text-[#c4dce9]">{label}</p>
  </div>
);
