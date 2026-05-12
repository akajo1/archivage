import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { FirstLoginChangePasswordPage } from '../features/auth/pages/FirstLoginChangePasswordPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { DocumentListPage } from '../features/documents/pages/DocumentListPage';
import { DocumentFormPage } from '../features/documents/pages/DocumentFormPage';
import { DocumentDetailPage } from '../features/documents/pages/DocumentDetailPage';
import { UserManagementPage } from '../features/users/pages/UserManagementPage';
import { RolePermissionsPage } from '../features/users/pages/RolePermissionsPage';
import { ChangePasswordPage } from '../features/users/pages/ChangePasswordPage';
import { ActivityLogPage } from '../features/logs/pages/ActivityLogPage';
import { GedDashboardPage, ArchivagePage, ClassificationPage, AdvancedSearchPage } from '../features/ged/pages';
import { MailRoutingInboxPage, MailRoutingDetailPage, RoutingTemplateManagementPage } from '../features/mail-routing/pages';
import { Layout } from './Layout';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/first-login-change-password', element: <FirstLoginChangePasswordPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      // GED Dashboard (accueil)
      {
        index: true,
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'dashboard', operation: 'canRead' }}>
            <GedDashboardPage />
          </ProtectedRoute>
        ),
      },

      // Documents GED
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

       // Routing Templates
       {
         path: 'mail-routing/templates',
         element: (
           <ProtectedRoute requiredPermission={{ feature: 'mail_routing', operation: 'canRead' }}>
             <RoutingTemplateManagementPage />
           </ProtectedRoute>
         ),
       },

      // Mail Routing / Courrier
      {
        path: 'mail-routing/inbox',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canRead' }}>
            <MailRoutingInboxPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mail-routing/:routingId',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canRead' }}>
            <MailRoutingDetailPage />
          </ProtectedRoute>
        ),
      },

      // Archivage
      {
        path: 'archivage',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canRead' }}>
            <ArchivagePage />
          </ProtectedRoute>
        ),
      },

      // Classification
      {
        path: 'classification',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canRead' }}>
            <ClassificationPage />
          </ProtectedRoute>
        ),
      },

      // Recherche avancée
      {
        path: 'search',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'documents', operation: 'canRead' }}>
            <AdvancedSearchPage />
          </ProtectedRoute>
        ),
      },

      // Admin
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
        path: 'logs',
        element: (
          <ProtectedRoute requiredPermission={{ feature: 'logs', operation: 'canRead' }}>
            <ActivityLogPage />
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

