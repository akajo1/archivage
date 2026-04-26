import { IsBoolean, IsIn, IsString } from 'class-validator';

export const ROLE_FEATURES = [
  'dashboard',
  'documents',
  'users',
  'roles',
  'badges',
  'confidentiality',
] as const;

export type RoleFeatureKey = (typeof ROLE_FEATURES)[number];

export class FeaturePermissionDto {
  @IsString()
  @IsIn(ROLE_FEATURES)
  feature!: RoleFeatureKey;

  @IsBoolean()
  canRead!: boolean;

  @IsBoolean()
  canEdit!: boolean;

  @IsBoolean()
  canDelete!: boolean;

  @IsBoolean()
  canSearch!: boolean;
}

