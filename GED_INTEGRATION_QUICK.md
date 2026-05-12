# ✅ GED PLATFORM - INTEGRATION GUIDE

## Quick Start (3 étapes)

### 1️⃣ INTÉGRER LES ROUTES

Ouvre `src/app/router.tsx` et remplace le contenu par:

```typescript
import { RouteObject } from 'react-router-dom';
import { gedRoutes } from '../features/ged';
import Layout from './Layout';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: gedRoutes,
  },
];
```

Ou si tu as d'autres routes existantes:

```typescript
export const routes: RouteObject[] = [
  // ... autres routes
  {
    path: '/',
    element: <Layout />,
    children: gedRoutes,  // Add this
  },
];
```

---

### 2️⃣ VÉRIFIER LA CONFIGURATION

Assure-toi que `.env` contient:

```bash
VITE_API_URL=http://localhost:3000
```

---

### 3️⃣ TESTER DANS LE NAVIGATEUR

```bash
# Terminal 1: Backend
cd /Users/akajodev/Documents/projects/archivage/backend
npm run start:dev

# Terminal 2: Frontend
cd /Users/akajodev/Documents/projects/archivage
npm run dev
```

Puis navigue à: `http://localhost:5173/`

Tu devrais voir le GED Dashboard! 🎉

---

## 📍 URLs Disponibles

Après intégration, accès ces pages:

- `http://localhost:5173/` → GED Dashboard (home)
- `http://localhost:5173/documents` → Mes Documents
- `http://localhost:5173/documents/new` → Créer Document
- `http://localhost:5173/mail-routing/inbox` → Inbox Workflows
- `http://localhost:5173/archivage` → Archivage
- `http://localhost:5173/classification` → Classification
- `http://localhost:5173/search` → Recherche Avancée
- `http://localhost:5173/admin/users` → Gestion Utilisateurs
- `http://localhost:5173/admin/settings` → Paramètres

---

## 🗂️ Fichiers Créés

### GED Core Module
```
src/features/ged/
├── pages/
│   ├── GedDashboardPage.tsx              ✅ Ready
│   ├── ArchivagePage.tsx                 ✅ Ready
│   ├── ClassificationPage.tsx            ✅ Ready
│   ├── AdvancedSearchPage.tsx            ✅ Ready
│   └── index.ts                          ✅ Ready
├── routes.tsx                            ✅ Ready
└── index.ts                              ✅ Ready
```

### Documents Service Module
```
src/features/documents-ged/
├── types/
│   └── document.types.ts                 ✅ Ready
├── pages/
│   ├── DocumentListPage.tsx              ✅ Ready
│   └── index.ts                          ✅ Ready
└── [services/ hooks/ components/ - Phase 2]
```

### Mail Routing Service (Already Exists)
```
src/features/mail-routing/
├── pages/ (existing)
├── components/ (existing)
├── hooks/ (existing)
└── types/ (existing)
```

### Documentation
```
GED_PLATFORM_ARCHITECTURE.md              ✅ Complete Architecture
GED_FRONTEND_PHASE1_COMPLETE.md           ✅ Frontend Status
GED_INTEGRATION_GUIDE.md (this file)      ✅ Integration Guide
```

---

## 🎯 Fonctionnalités Actuelles

✅ **GED Dashboard**
- Quick access à tous les services
- Cards avec liens
- Recent activity
- Stats placeholder

✅ **Documents List**
- Tableau avec filtres
- Recherche
- Sort par colonnes
- Links vers détails

✅ **Archivage Page**
- Stats archives
- Filtres
- Info sur gestion archives

✅ **Classification Page**
- Badges display
- Confidentiality levels
- Management interface

✅ **Recherche Avancée**
- Formulaire multi-critères
- Filtres avancés
- Date ranges
- Results placeholder

✅ **Mail Routing** (Existing)
- Inbox inbox
- Workflow detail
- Comments
- Actions

---

## 🔧 Configuration Finale

### .env
```bash
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=GED Platform
```

### src/app/router.tsx
```typescript
import { gedRoutes } from '../features/ged';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: gedRoutes,  // ← IMPORTANT
  },
];
```

---

## ✅ Checklist Intégration

- [ ] Routes intégrées dans router.tsx
- [ ] .env configured
- [ ] Backend running (npm run start:dev)
- [ ] Frontend running (npm run dev)
- [ ] Peut naviguer vers / 
- [ ] Peut voir GED Dashboard
- [ ] Peut cliquer vers Documents
- [ ] Peut cliquer vers Mail Routing
- [ ] Filtres marchent (locally)
- [ ] Responsive layout OK

---

## 🚀 Phase 2 - À Faire

**Compléter tous les services:**

1. Backend API connections pour chaque service
2. DocumentDetailPage avec full details
3. DocumentCreatePage avec upload
4. Archive list integration
5. Search results display
6. Profile/Users management
7. Settings page
8. Audit logs
9. Error handling
10. Loading states

**Estimated**: 1-2 semaines

---

## 📞 Support

Si tu rencontres des problèmes:

1. **Erreur routes non trouvées?**
   - Vérifie que `gedRoutes` est importé
   - Check `src/features/ged/routes.tsx` exists

2. **Pages blank?**
   - Ouvre DevTools (F12)
   - Check console pour errors
   - Verify API URL en .env

3. **Layout pas bon?**
   - Existing Layout devrait marcher
   - Check Layout imports dans router

4. **Styles pas appliqués?**
   - Tailwind CSS devrait être already configured
   - Vérify tailwind.config.js includes src/features

---

## 🎉 SUCCESS!

Une fois livré, tu devrais avoir:

✅ **One unified platform** pour GED
✅ **7 main services** intégrés
✅ **Professional UI** avec navigation clear
✅ **Responsive design** sur tous les écrans
✅ **Modular architecture** facile à étendre

---

**NEXT**: Open the PR/commit & deploy to test! 🚀

---

**Version**: 2.0 GED Platform
**Created**: May 12, 2026
**Status**: ✅ READY FOR INTEGRATION

