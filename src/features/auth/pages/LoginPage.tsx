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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl">📁</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Archivage</h1>
          <p className="mt-1 text-sm text-gray-500">Connectez-vous à votre espace</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Connexion</h2>

          {apiError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
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

            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

