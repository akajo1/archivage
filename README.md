# Archivage documentaire

Application web d'archivage documentaire avec :

- authentification JWT
- gestion de documents
- badges d'importance
- niveaux de confidentialité
- contrôle d'accès par rôle (admin / manager / user)
- frontend en architecture **DDD feature-oriented** + **Atomic Design**

## Stack

### Frontend

- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- React Router
- Zustand
- React Hook Form
- Axios

### Backend

- NestJS
- Prisma v7
- PostgreSQL
- JWT / Passport
- Multer pour l'upload local en développement

## Structure

```text
archivage/
├── src/                # frontend Vite/React
├── backend/            # API NestJS + Prisma
└── docker-compose.yml  # PostgreSQL local
```

## Fonctionnalités déjà implémentées

- inscription / connexion
- récupération du profil connecté
- liste des documents
- filtrage par badge / confidentialité / recherche
- création de document
- édition de document
- suppression de document
- détail d'un document
- endpoints badges et confidentialité
- endpoint de healthcheck backend (`GET /health`)
- indicateur d'etat backend visible dans la navbar frontend
- RBAC par rôle côté backend
- upload local des fichiers dans `backend/uploads/`

## Variables d'environnement

### Frontend

Fichier racine : `.env`

```dotenv
VITE_API_URL=http://localhost:3000
```

### Backend

Fichier : `backend/.env`

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/archivage?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

## Démarrage rapide

### 1. Lancer PostgreSQL

```bash
cd /Users/akajodev/Documents/projects/archivage
docker compose up -d
```

### 2. Initialiser la base

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npx prisma generate
npx prisma db push
npm run seed
```

### 3. Lancer le backend

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npm run start:dev
```

### Vérifier la santé du backend

```bash
curl http://localhost:3000/health
```

### 4. Lancer le frontend

```bash
cd /Users/akajodev/Documents/projects/archivage
npm run dev
```

## Comptes de démonstration

Après le seed :

- `admin@archivage.fr` / `admin123`
- `manager@archivage.fr` / `manager123`

## Vérifications réalisées

Les commandes suivantes ont été validées pendant l'implémentation :

```bash
cd /Users/akajodev/Documents/projects/archivage
npm run lint
npm run build

cd /Users/akajodev/Documents/projects/archivage/backend
npm run lint
npm run build
npx prisma generate
npx tsc --noEmit
```

## Scripts backend utiles

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:deploy
npm run db:studio
```

## Notes techniques

- Le frontend consomme les réponses documents en **camelCase** (`createdBy`, `createdAt`, `fileUrl`).
- Les fichiers uploadés sont servis par le backend via `/uploads/...`.
- Les permissions documentaires sont appliquées dans `backend/src/documents/documents.service.ts`.
- Le stockage des fichiers est local pour le dev, et peut être remplacé plus tard par S3 ou Cloudinary.
- Si PostgreSQL n'est pas démarré, l'API renvoie désormais un **503 Service Unavailable** explicite au lieu d'une erreur Prisma brute.
- Si `docker` n'est pas disponible sur la machine, il faut démarrer PostgreSQL par un autre moyen compatible avec `DATABASE_URL`.

## Prochaines améliorations possibles

- pagination de la liste des documents
- aperçu inline des fichiers
- tests e2e auth/documents
- audit trail des modifications
- migration vers stockage cloud des pièces jointes

