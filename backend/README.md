# Archivage - Backend API

API NestJS de l'application d'archivage documentaire.

Elle couvre l'authentification JWT, la gestion documentaire, les permissions par role (RBAC granulaire par fonctionnalite), les journaux d'activite et le service de fichiers locaux pour les pieces jointes.

## Stack

- NestJS 11
- Prisma + MySQL (`schema.prisma` configure `provider = "mysql"`)
- JWT / Passport
- class-validator + ValidationPipe globale
- Multer (upload local en developpement)

## Fonctionnalites backend

- Authentification: `register`, `login`, `refresh`, `logout`, `me`
- Gestion des mots de passe:
  - `forgot-password` (anti-enumeration email)
  - `reset-password`
  - `change-password`
  - `first-login-change-password`
- Documents:
  - CRUD
  - upload de fichier principal
  - gestion d'annexes multiples
  - filtres (`badge_id`, `confidentiality_id`, `search`)
- Utilisateurs: CRUD + reset admin du mot de passe
- Roles applicatifs: CRUD
- Permissions par role: lecture/modification des permissions globales + par fonctionnalite
- Referentiels: badges et niveaux de confidentialite
- Activity logs: listing pagine, stats, export
- Health check: etat API + base

## Modules exposes

- `auth`
- `documents`
- `users`
- `roles`
- `role-permissions`
- `badges`
- `confidentiality`
- `activity-logs`
- `health`

## Variables d'environnement

Creer `backend/.env`.

```dotenv
DATABASE_URL="mysql://user:password@localhost:3306/archivage"
JWT_SECRET="change-me-access-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="change-me-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

Notes:
- `JWT_SECRET` et `JWT_REFRESH_SECRET` sont requis pour les strategies JWT.
- `FRONTEND_URL` est utilise pour construire le lien de reset password (fallback `http://localhost:5173`).

## Installation

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npm install
```

## Initialisation de la base

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npm run db:generate
npm run db:push
npm run seed
```

Alternative avec migrations:

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npm run db:migrate
```

## Lancer l'API

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npm run start:dev
```

Build + prod:

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npm run build
npm run start:prod
```

## Verifications rapides

Health check:

```bash
curl http://localhost:3000/health
```

L'API active CORS pour `http://localhost:5173` avec credentials.

## Comptes de demonstration (seed)

- `admin@archivage.fr` / `admin123`
- `manager@archivage.fr` / `manager123`

## Resume des routes

Base URL locale par defaut: `http://localhost:3000`

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh-permissions`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/first-login-change-password`
- `POST /auth/change-password`
- `GET /documents`, `GET /documents/:id`, `POST /documents`, `PUT /documents/:id`, `DELETE /documents/:id`
- `POST /documents/:id/attachments`, `DELETE /documents/:id/attachments/:attachmentId`
- `GET /users`, `GET /users/:id`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`
- `POST /users/:id/admin-reset-password`
- `GET /roles`, `GET /roles/:id`, `POST /roles`, `PATCH /roles/:id`, `DELETE /roles/:id`
- `GET /role-permissions`, `PUT /role-permissions/:role`
- `GET /badges`
- `GET /confidentiality`
- `GET /activity-logs`, `GET /activity-logs/stats`, `GET /activity-logs/export`

La plupart des routes (hors `health` et endpoints publics auth) sont protegees par:
- `JwtAuthGuard`
- `FeaturePermissionGuard` (controle par fonctionnalite + operation `canRead|canCreate|canEdit|canDelete|canSearch`)

## Uploads

- Dossier local: `backend/uploads/`
- Service statique: `/uploads/*`
- `documents` utilise Multer (`FileInterceptor` et `FilesInterceptor`)

## Scripts utiles

```bash
cd /Users/akajodev/Documents/projects/archivage/backend
npm run lint
npm run test
npm run test:e2e
npm run test:cov
npm run db:studio
```

