import { RouteObject } from 'react-router-dom';
import { MailRoutingInboxPage, MailRoutingDetailPage } from './pages';

/**
 * Routes pour le module Mail Routing
 */
export const mailRoutingRoutes: RouteObject[] = [
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
];

