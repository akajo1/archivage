import { RouteObject } from 'react-router-dom';
import {
  GedDashboardPage,
  ArchivagePage,
  ClassificationPage,
  AdvancedSearchPage,
} from './pages';
import { DocumentListPage } from '../documents-ged/pages';
import { MailRoutingInboxPage, MailRoutingDetailPage } from '../mail-routing/pages';

/**
 * Routes principales GED Platform
 */
export const gedRoutes: RouteObject[] = [
  // Dashboard
  {
    path: '',
    element: <GedDashboardPage />,
  },

  // Documents
  {
    path: 'documents',
    element: <DocumentListPage />,
  },
  {
    path: 'documents/new',
    element: <div>📄 Créer nouveau document (to implement)</div>,
  },
  {
    path: 'documents/:documentId',
    element: <div>📄 Détail document (to implement)</div>,
  },

  // Mail Routing (Workflow service)
  {
    path: 'mail-routing',
    children: [
      {
        path: 'inbox',
        element: <MailRoutingInboxPage />,
      },
      {
        path: ':routingId',
        element: <MailRoutingDetailPage />,
      },
    ],
  },

  // Archivage
  {
    path: 'archivage',
    element: <ArchivagePage />,
  },

  // Classification
  {
    path: 'classification',
    element: <ClassificationPage />,
  },

  // Recherche
  {
    path: 'search',
    element: <AdvancedSearchPage />,
  },

  // Admin (users, settings)
  {
    path: 'admin',
    children: [
      {
        path: 'users',
        element: <div>👥 Gestion Utilisateurs (to implement)</div>,
      },
      {
        path: 'settings',
        element: <div>⚙️ Paramètres Système (to implement)</div>,
      },
    ],
  },
];

/**
 * Routes GED avec layout principal
 */
export const gedPlatformRoutes: RouteObject[] = [
  {
    path: '/',
    element: <div>Layout GED (to implement - using existing Layout)</div>,
    children: gedRoutes,
  },
];

