# 📁 GED Platform - Plateforme Complète de Gestion Électronique de Documents

## Architecture Complète

La plateforme a été restructurée pour devenir une véritable **GED (Gestion Électronique de Documents)** avec "Archivage" comme service parmi d'autres.

```
GED Platform (plateforme principale)
├── 📮 Mail Routing (Workflow service)
│   ├── Inbox documents
│   ├── Forward/Verify/Reject
│   └��─ Comment threads
├── 📄 Documents (Document management service)
│   ├── Créer/Modifier/Supprimer documents
│   ├── Versioning
│   ├── Upload files
│   └── Classification
├── 📦 Archivage (Archive service)
│   ├── Documents archivés
│   ├── Rétention automatique
│   ├── Legal hold
│   └── Export
├── 🏷️ Classification (Classification service)
│   ├── Badges management
│   └── Confidentialité levels
├── 🔍 Recherche Avancée (Search service)
│   ├── Recherche full-text
│   ├── Filtres multiples
│   └── Saved searches
└── 👥 Administration (Admin service)
    ├── Gestion utilisateurs
    ├── Rôles & permissions
    └── Configuration système
```

## 📂 Nouvelle Structure Frontend

```
src/features/
├── ged/                         # Platform core
│   ├── pages/
│   │   ├── GedDashboardPage.tsx
│   │   ├── ArchivagePage.tsx
│   │   ├── ClassificationPage.tsx
│   │   └── AdvancedSearchPage.tsx
│   ├── routes.tsx
│   └── index.ts
├── documents-ged/               # Document service
│   ├── types/
│   │   └── document.types.ts
│   ├── pages/
│   │   └── DocumentListPage.tsx
│   ├── services/
│   ├── components/
│   └── hooks/
├── mail-routing/                # Workflow service (existing)
│   ├── pages/ (existing)
│   ├── components/ (existing)
│   └── hooks/ (existing)
└── classification/              # Classification service (future)
    ├── services/
    └── components/
```

## 🎯 Pages Principales

| URL | Page | Description |
|-----|------|-------------|
| `/` | GedDashboardPage | Dashboard principal avec quick access |
| `/documents` | DocumentListPage | Liste complète des documents |
| `/documents/new` | CreateDocumentPage | Créer nouveau document |
| `/documents/:id` | DocumentDetailPage | Détail document (with versioning) |
| `/documents/:id/versions` | DocumentVersionsPage | Historique versions |
| `/mail-routing/inbox` | MailRoutingInboxPage | Inbox workflows |
| `/mail-routing/:id` | MailRoutingDetailPage | Détail workflow |
| `/archivage` | ArchivagePage | Gestion archives |
| `/classification` | ClassificationPage | Badges & confidentialité |
| `/search` | AdvancedSearchPage | Recherche avancée |
| `/admin/users` | UsersManagementPage | Gestion utilisateurs |
| `/admin/settings` | SettingsPage | Configuration système |

## 🚀 Services Intégrés

### 1. **Mail Routing (Workflow Service)**
- Gestion workflows courrier
- Forward/Verify/Reject documents
- Commentaires et collaboration
- Timeline des actions

### 2. **Documents Management** (À compléter)
- CRUD operations
- File upload/download
- Versioning automatique
- Classification (badges + confidentialité)
- Share & permissions

### 3. **Archivage** (À compléter)
- Documents archivés
- Rétention automatique
- Legal hold support
- Export archives
- Audit trail

### 4. **Classification** (À compléter)
- Badges (critique, normal, faible)
- Confidentialité (public, interne, confidentiel, secret)
- Rules management
- Tagging system

### 5. **Recherche Avancée** (À compléter)
- Full-text search
- Filtres multiples
- Date ranges
- Author/department filters
- Saved searches

### 6. **Admin/Configuration** (À compléter)
- Users management
- Roles & permissions
- Department management
- System settings
- Audit logs

## 💻 Intégration dans l'app

### Etape 1 : Mettre à jour le routeur

```typescript
// src/app/router.tsx
import { gedRoutes } from '../features/ged';

export const routes: RouteObject[] = [
  {
    path: '/ged',
    element: <Layout />,  // Existing layout
    children: gedRoutes,  // All GED routes
  },
  // ... keep existing routes like /auth, /login if needed
];
```

### Etape 2 : Ajouter lien navigation principal

```typescript
// src/app/Layout.tsx or Navigation component
<Link to="/ged">📁 GED Platform</Link>
```

### Etape 3 : Rediriger homepage

```typescript
// src/app/router.tsx
{
  path: '/',
  redirect: '/ged',  // OR navigate in component
}
```

## 🎨 Styles

- Utilise Tailwind CSS existant
- Classe `.arch-card` pour cohérence cards
- Couleurs consistent avec theme existant
- Icons emojis pour UX rapide

## 🔐 Permissions & Sécurité

### Par Service:
- **Mail Routing**: Seul assignee actuel peut agir
- **Documents**: ACL par document + RBAC global
- **Archivage**: Admin/manager seulement
- **Classification**: Admin seulement (read for all)
- **Recherche**: Visible seulement docs accessibles
- **Admin**: Admin role seulement

## 📊 Données Modèles

### Document (Core)
```typescript
{
  id: string;
  title: string;
  status: 'draft' | 'received' | 'in_review' | 'validated' | 'archived' | ...
  documentType?: string;
  badge?: Badge;
  confidentiality?: Confidentiality;
  createdBy: User;
  versions: DocumentVersion[];
  attachments: DocumentAttachment[];
  registrationNumber?: string;
  // ...
}
```

### MailRouting (Workflow)
```typescript
{
  id: string;
  documentId: string;
  status: 'pending' | 'forwarded' | 'verified' | 'rejected' | ...
  currentAssignee?: User;
  participants: MailParticipant[];
  comments: MailComment[];
  actions: MailRoutingAction[];
  // ...
}
```

## 📝 À Compléter (Phase 2)

- [ ] DocumentDetailPage avec full details
- [ ] DocumentCreatePage avec file upload
- [ ] DocumentVersionsPage avec diff viewer
- [ ] DocumentsService (API client)
- [ ] UsersManagementPage
- [ ] SettingsPage
- [ ] Recherche avancée logic
- [ ] Dashboard stats backend integration
- [ ] Archivage list backend integration
- [ ] Hooks pour chaque service
- [ ] Components réutilisables par service

## ✨ Points Forts de la New Architecture

✅ **Modulaire** - Chaque service indépendant
✅ **Scalable** - Facile d'ajouter nouvelles fonctionnalités
✅ **Clean** - Séparation concerns claire
✅ **Maintenable** - Structure logique et organisée
✅ **User-centric** - Dashboard claire avec accès rapide
✅ **Services-oriented** - Plateforme vs services clairs

## 🔄 Migration depuis Archivage

**Ancienne structure:** Plateforme = Archivage
**Nouvelle structure:** Plateforme = GED (avec Archivage comme service)

Les features existantes (Auth, Users, Documents, Mail-Routing) restent actives mais réorganisées sous GED.

---

**Status**: ✅ ARCHITECTURE COMPLÈTE - PRÊTE POUR PHASE 2
**Version**: 2.0 (GED Platform)
**Created**: May 12, 2026

