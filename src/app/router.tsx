import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { DashboardPage } from '../features/documents/pages/DashboardPage';
import { DocumentListPage } from '../features/documents/pages/DocumentListPage';
import { DocumentFormPage } from '../features/documents/pages/DocumentFormPage';
import { DocumentDetailPage } from '../features/documents/pages/DocumentDetailPage';
import { UserManagementPage } from '../features/users/pages/UserManagementPage';
import { RolePermissionsPage } from '../features/users/pages/RolePermissionsPage';
import { ChangePasswordPage } from '../features/users/pages/ChangePasswordPage';
import { Layout } from './Layout';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      // ...existing routes...
      {
        index: true,
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'dashboard', operation: 'canRead' }}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'dashboard', operation: 'canRead' }}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canRead' }}>
            <DocumentListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents/new',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canCreate' }}>
            <DocumentFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents/:id',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canRead' }}>
            <DocumentDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents/:id/edit',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canEdit' }}>
            <DocumentFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'users', operation: 'canRead' }}>
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'roles', operation: 'canRead' }}>
            <RolePermissionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'change-password',
        element: <ChangePasswordPage />,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

