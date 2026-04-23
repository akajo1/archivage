import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { DocumentListPage } from '../features/documents/pages/DocumentListPage';
import { DocumentFormPage } from '../features/documents/pages/DocumentFormPage';
import { DocumentDetailPage } from '../features/documents/pages/DocumentDetailPage';
import { UserManagementPage } from '../features/users/pages/UserManagementPage';
import { RolePermissionsPage } from '../features/users/pages/RolePermissionsPage';
import { Layout } from './Layout';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/documents" replace /> },
      { path: 'documents', element: <DocumentListPage /> },
      { path: 'documents/new', element: <DocumentFormPage /> },
      { path: 'documents/:id', element: <DocumentDetailPage /> },
      { path: 'documents/:id/edit', element: <DocumentFormPage /> },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRole="admin">
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles',
        element: (
          <ProtectedRoute requiredRole="admin">
            <RolePermissionsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/documents" replace /> },
]);

