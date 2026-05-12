# Mail Routing Frontend - React Module

Système complet de gestion de workflow courrier avec interface React.

## 📂 Structure

```
src/features/mail-routing/
├── types/
│   └── mail-routing.types.ts       # Types TypeScript
├── services/
│   └── mailRoutingClient.ts        # Client API
├── hooks/
│   └── useMailRouting.ts           # Hooks personnalisés
├── components/
│   ├── MailStatusBadge.tsx         # Badge statut
│   ├── MailParticipantList.tsx     # Liste participants
│   ├── MailCommentThread.tsx       # Thread commentaires
│   ├── MailRoutingActions.tsx      # Actions (forward, verify, reject)
│   └── index.ts
├── pages/
│   ├── MailRoutingInboxPage.tsx    # Inbox principale
│   ├── MailRoutingDetailPage.tsx   # Détail d'un routing
│   └── index.ts
├── routes.tsx                       # Définition des routes
└── index.ts                         # Exports principaux
```

## 🚀 Usage

### 1. Intégrer les routes

```typescript
// src/app/router.tsx
import { mailRoutingRoutes } from '../features/mail-routing/routes';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // ... autres routes
      ...mailRoutingRoutes,
    ],
  },
];
```

### 2. Ajouter lien dans navigation

```typescript
import { Link } from 'react-router-dom';

<Link to="/mail-routing/inbox">📮 Mon Inbox</Link>
```

## 🎯 Composants

### MailStatusBadge
Affiche le statut avec couleur appropriée.

```tsx
<MailStatusBadge status={MailRoutingStatus.VERIFIED} size="md" />
```

### MailParticipantList
Liste des participants avec rôles.

```tsx
<MailParticipantList participants={routing.participants} currentUser={user} />
```

### MailCommentThread
Système de commentaires threadés.

```tsx
<MailCommentThread 
  comments={routing.comments} 
  routingId={routing.id}
  onCommentAdded={handleCommentAdded}
/>
```

### MailRoutingActions
Boutons d'actions (forward, verify, reject).

```tsx
<MailRoutingActions 
  routing={routing} 
  currentUserId={userId}
  onActionComplete={handleRefresh}
/>
```

## 🪝 Hooks

### useMailRouting(routingId)
Charge les détails d'un routing.

```tsx
const { routing, loading, error, refetch } = useMailRouting(routingId);
```

### useMailRoutingInbox(status?)
Charge l'inbox filtrée.

```tsx
const { routings, total, loading, error } = useMailRoutingInbox(MailRoutingStatus.PENDING);
```

### useMailRoutingTimeline(routingId)
Charge la timeline (actions + commentaires).

```tsx
const { timeline, loading } = useMailRoutingTimeline(routingId);
```

### useForwardRouting()
Forward un document.

```tsx
const { forward, loading } = useForwardRouting();
const result = await forward(routingId, receiverId, ccUserIds, note);
```

### useVerifyRouting()
Valide un document.

```tsx
const { verify, loading } = useVerifyRouting();
const result = await verify(routingId, note);
```

### useRejectRouting()
Rejette un document.

```tsx
const { reject, loading } = useRejectRouting();
const result = await reject(routingId, rejectionReason);
```

## 📊 Types Principaux

```typescript
interface MailRouting {
  id: string;
  documentId: string;
  document: Document;
  status: MailRoutingStatus;
  initiatedBy: User;
  currentAssignee?: User;
  participants: MailParticipant[];
  actions: MailRoutingAction[];
  comments: MailComment[];
  // ...
}

enum MailRoutingStatus {
  PENDING = 'pending',
  FORWARDED = 'forwarded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  // ...
}
```

## 🎨 Styling

Utilise Tailwind CSS + classe personnalisée `.arch-card` pour cohérence avec l'app.

```tsx
<div className="arch-card rounded-lg p-6">
  Contenu
</div>
```

## 🔐 Authentification

Le token JWT est manié automatiquement dans `mailRoutingClient`:
- Récupère le token depuis `localStorage.getItem('access_token')`
- Ajoute le header `Authorization: Bearer {token}` à chaque requête

## ⚙️ Configuration

### Variable d'environnement

```bash
# .env
VITE_API_URL=http://localhost:3000
```

## 📚 Pages

### Inbox (`/mail-routing/inbox`)
- Liste des documents à traiter
- Filtrage par statut
- Navigation vers détail

### Detail (`/mail-routing/:routingId`)
- Informations document complet
- Actions (forward, verify, reject)
- Liste des participants
- Historique actions + commentaires
- Système de commentaires

## 🧪 Exemple d'usage complet

```tsx
import { useMailRouting, MailRoutingInboxPage } from '@/features/mail-routing';

function MyApp() {
  const { routing, loading } = useMailRouting('routing-123');
  
  if (loading) return <div>Chargement...</div>;
  
  return (
    <div>
      <h1>{routing.document.title}</h1>
      <MailStatusBadge status={routing.status} />
    </div>
  );
}
```

## ��� Notes

- Tous les composants sont responsifs (mobile-friendly)
- Gestion d'erreur intégrée
- Loading states sur toutes les actions async
- Validation côté client des formulaires

---

**Version**: 1.0
**Last Updated**: May 12, 2026

