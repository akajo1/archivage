# 📁 Projet : Application Web d'Archivage Documentaire

## 🎯 Objectif
Créer une application web permettant de :
- Stocker et organiser des documents
- Assigner des badges d’importance
- Gérer différents niveaux de confidentialité
- Contrôler l’accès selon les rôles utilisateurs

---

## 🧱 1. Définition du périmètre (MVP)

### Fonctionnalités principales
- Authentification (login / register)
- Upload de documents
- Attribution de badge (importance)
- Attribution de niveau de confidentialité
- Liste des documents
- Filtrage (badge, confidentialité)
- creation et edition de document

---

## 🧠 2. Modélisation des données

### 📄 Document
- id
- title
- file_url
- created_at
- created_by (user_id)
- badge_id
- confidentiality_id

### 🏷️ Badge
- id
- name (critique, normal, faible)
- color

### 🔐 Confidentialité
- id
- level (public, interne, confidentiel, secret)

### 👤 User
- id
- name
- email
- password
- role (admin, manager, user)

---

## 🔗 3. Relations
- Un document appartient à un utilisateur
- Un document a un badge
- Un document a un niveau de confidentialité

---

## 🔐 4. Gestion des accès (RBAC)

### Rôles
- Admin → accès total
- Manager → accès interne + confidentiel
- User → accès public uniquement

### Règles
- Vérifier les permissions à chaque requête backend
- Bloquer l’accès aux documents sensibles

---

## ⚙️ 5. Architecture technique

### Frontend
- Framework : vitejs
- UI : Tailwind CSS
- atomic design
- DDD feature oriented

### Backend
- Nestjs

### Base de données
- PostgreSQL

### Stockage fichiers
- AWS S3 / Cloudinary / Local (dev)

---

## 🧩 6. Structure du projet

### Backend