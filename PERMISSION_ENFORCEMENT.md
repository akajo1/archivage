## Permission Enforcement Implementation Summary

### Overview
A comprehensive role-based access control (RBAC) system has been implemented across the entire application, with **per-feature operation-level permissions** enforced at both backend (API) and frontend (UI) layers.

---

## Architecture

### Backend Layer (`/backend/src`)

#### 1. **Permission Utilities** (`common/utils/permission.utils.ts`)
- Core utility functions for permission checking
- Methods: `hasFeatureAccess()`, `canReadFeature()`, `canEditFeature()`, `canDeleteFeature()`, `canSearchFeature()`
- Supports 6 features: dashboard, documents, users, roles, badges, confidentiality
- Supports 4 operations per feature: canRead, canEdit, canDelete, canSearch

#### 2. **Feature Permission Guard** (`common/guards/feature-permission.guard.ts`)
- Decorator: `@FeaturePermission({ feature, operation })`
- Enforces permissions at endpoint level
- Checks user's feature permissions from JWT payload (via userPermissions)
- Throws `ForbiddenException` if user lacks required permission

#### 3. **Guarded API Endpoints**
All endpoints now enforce feature-based permissions:

**Documents Controller:**
- `GET /documents` → requires `documents.canRead`
- `GET /documents/:id` → requires `documents.canRead`
- `POST /documents` → requires `documents.canEdit`
- `POST /documents/:id/attachments` → requires `documents.canEdit`
- `DELETE /documents/:id/attachments/:attachmentId` → requires `documents.canDelete`
- `PUT /documents/:id` → requires `documents.canEdit`
- `DELETE /documents/:id` → requires `documents.canDelete`

**Users Controller:**
- `GET /users` → requires `users.canRead` + admin/manager role
- `GET /users/:id` → requires `users.canRead` + admin/manager role
- `POST /users` → requires `users.canEdit` + admin role
- `PATCH /users/:id` → requires `users.canEdit` + user role
- `DELETE /users/:id` → requires `users.canDelete` + admin role

**Roles Controller:**
- `GET /roles` → requires `roles.canRead` + admin/manager role
- `GET /roles/:id` → requires `roles.canRead` + admin/manager role
- `POST /roles` → requires `roles.canEdit` + admin role
- `PATCH /roles/:id` → requires `roles.canEdit` + admin role
- `DELETE /roles/:id` → requires `roles.canDelete` + admin role

**Badges & Confidentiality Controllers:**
- `GET /badges` → requires `badges.canRead`
- `GET /confidentiality` → requires `confidentiality.canRead`

**Role Permissions Controller:**
- `GET /role-permissions` → requires `roles.canRead` + admin/manager role
- `PUT /role-permissions/:role` → requires `roles.canEdit` + admin role

---

### Frontend Layer (`/src`)

#### 1. **Permission Utilities** (`shared/utils/permissionUtils.ts`)
- Mirrors backend permission checking logic
- Provides permission validation functions for UI components
- Methods for checking feature access and resource access (badges, confidentialities)

#### 2. **Permission Hook** (`features/auth/hooks/usePermissions.ts`)
```typescript
const { canEditFeature, canDeleteFeature, canReadFeature, canSearchFeature } = usePermissions();
```
- Provides reactive permission checks based on current user
- Memoized callbacks for performance
- Auto-updates when user permissions change

#### 3. **Permission-Gated UI Components**

**DocumentListPage (`features/documents/pages/DocumentListPage.tsx`):**
- "Create Document" button shown only if `canEditFeature('documents')`
- Pass `canDelete` prop to DocumentTable/DocumentListView components

**DocumentTable & DocumentListView:**
- Edit button shown if `canEdit || isAdmin || userCreatedDoc`
- Delete button shown only if `canDelete || isAdmin`

**DocumentListPage (`features/documents/pages/DashboardPage.tsx`):**
- Dashboard shortcuts filtered based on permissions:
  - "New Document" shown if `canEditFeature('documents')`
  - "Users" link shown if `canReadFeature('users') || isAdmin`
  - "Roles & Permissions" link shown if `canReadFeature('roles') || isAdmin`

**UserManagementPage (`features/users/pages/UserManagementPage.tsx`):**
- "Create User" section shown only if `canEditFeature('users')`
- Delete button shown only if `canDeleteFeature('users')`

**RolePermissionsPage (`features/users/pages/RolePermissionsPage.tsx`):**
- "Create Role" section shown only if `canEditFeature('roles')`
- Edit role button shown only if `canEditFeature('roles')`
- Delete role button shown only if `canDeleteFeature('roles')`

---

## Permission Model

### Features
```typescript
type RoleFeature = 'dashboard' | 'documents' | 'users' | 'roles' | 'badges' | 'confidentiality'
```

### Operations
```typescript
type FeatureOperation = 'canRead' | 'canEdit' | 'canDelete' | 'canSearch'
```

### Feature Permission Entity
```typescript
interface FeaturePermission {
  feature: RoleFeature
  canRead: boolean   // Can view/list resources
  canEdit: boolean   // Can create and modify resources
  canDelete: boolean // Can delete resources
  canSearch: boolean // Can search resources
}
```

### Default Role Permissions (System Roles)

**Admin:**
- All features: canRead ✓, canEdit ✓, canDelete ✓, canSearch ✓

**Manager:**
- All features: canRead ✓, canEdit ✓, canDelete ✓, canSearch ✓

**User:**
- documents: canRead ✓, canEdit ✗, canDelete ✗, canSearch ✓
- users: canRead ✗, canEdit ✗, canDelete ✗, canSearch ✗
- roles: canRead ✗, canEdit ✗, canDelete ✗, canSearch ✗
- badges: canRead ✓, canEdit ✗, canDelete ✗, canSearch ✓
- confidentiality: canRead ✓, canEdit ✗, canDelete ✗, canSearch ✓
- dashboard: canRead ✓, canEdit ✗, canDelete ✗, canSearch ✗

---

## Database Schema

### RoleFeaturePermission Table
```sql
CREATE TABLE role_feature_permissions (
  id STRING PRIMARY KEY,
  feature STRING NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_search BOOLEAN DEFAULT false,
  role_permission_id STRING NOT NULL REFERENCES role_permissions(id) ON DELETE CASCADE,
  UNIQUE(role_permission_id, feature)
);
```

---

## User Permissions Payload

When user logs in or refreshes, JWT includes `userPermissions`:

```typescript
interface UserPermissions {
  badges: Badge[]                           // Accessible badges
  confidentialities: Confidentiality[]      // Accessible confidentiality levels
  featurePermissions: FeaturePermission[]  // Per-feature operations
  canRead: boolean                         // Legacy: can read documents
  canCreate: boolean                       // Legacy: can create documents
  canEdit: boolean                         // Legacy: can edit documents
}
```

The legacy fields are populated from feature permissions for backward compatibility:
- `canRead` ← `documents.canRead`
- `canCreate` ← `documents.canEdit`
- `canEdit` ← `documents.canEdit`

---

## Implementation Flow

### 1. User Login
1. User authenticates via `POST /auth/login`
2. Backend computes `userPermissions` from role's feature permissions
3. JWT includes user + permissions
4. Frontend stores in Zustand store + localStorage

### 2. API Request
1. Frontend includes JWT in Authorization header
2. Backend validates JWT and extracts user permissions
3. `FeaturePermissionGuard` checks required permission
4. If missing: throw 403 Forbidden
5. If present: proceed with request

### 3. UI Rendering
1. Component uses `usePermissions()` hook
2. Hook reads current user permissions from Zustand
3. Conditional rendering based on permission checks
4. Hidden buttons/sections for forbidden operations

---

## Testing Checklist

### Backend Enforcement
- [ ] Test each guarded endpoint with admin user → all allowed
- [ ] Test each guarded endpoint with manager user → all allowed
- [ ] Test document endpoints with user role:
  - [ ] GET /documents → 200 ✓
  - [ ] POST /documents → 403 ✗
  - [ ] DELETE /documents/:id → 403 ✗
- [ ] Test users endpoints with regular user → 403 ✗
- [ ] Create custom role with partial permissions → verify only permitted operations work

### Frontend Enforcement
- [ ] Login as admin → see all buttons/sections
- [ ] Login as manager → see all buttons/sections
- [ ] Login as user → missing buttons for disallowed operations
- [ ] Create custom user role with specific permissions → verify UI matches permissions
- [ ] Verify permissions persist after page refresh

---

## Future Enhancements

1. **Resource-Level Permissions**: Add checks on specific document/user ownership
2. **Audit Logging**: Log all permission-based access denials
3. **Permission Cache**: Cache computed permissions to reduce DB queries
4. **Delegation**: Allow managers to assign permissions within scoped features
5. **Time-Based Permissions**: Grant temporary elevated permissions
6. **Feature Flags**: Conditionally enable/disable features per role

---

## Files Modified/Created

### Backend
- ✅ `backend/src/common/utils/permission.utils.ts` (NEW)
- ✅ `backend/src/common/guards/feature-permission.guard.ts` (UPDATED)
- ✅ `backend/src/documents/documents.controller.ts` (UPDATED)
- ✅ `backend/src/users/users.controller.ts` (UPDATED)
- ✅ `backend/src/roles/roles.controller.ts` (UPDATED)
- ✅ `backend/src/role-permissions/role-permissions.controller.ts` (UPDATED)
- ✅ `backend/src/badges/badges.controller.ts` (UPDATED)
- ✅ `backend/src/confidentiality/confidentiality.controller.ts` (UPDATED)

### Frontend
- ✅ `src/shared/utils/permissionUtils.ts` (UPDATED)
- ✅ `src/features/auth/hooks/usePermissions.ts` (UPDATED)
- ✅ `src/features/documents/pages/DocumentListPage.tsx` (UPDATED)
- ✅ `src/features/documents/pages/DashboardPage.tsx` (UPDATED)
- ✅ `src/shared/components/organisms/DocumentTable.tsx` (UPDATED)
- ✅ `src/shared/components/organisms/DocumentListView.tsx` (UPDATED)
- ✅ `src/features/users/pages/UserManagementPage.tsx` (UPDATED)
- ✅ `src/features/users/pages/RolePermissionsPage.tsx` (UPDATED)

---

## Build Status

✅ **Frontend Build**: Successful
✅ **Backend Build**: Successful
✅ **No TypeScript errors**

---

Generated: April 26, 2026

