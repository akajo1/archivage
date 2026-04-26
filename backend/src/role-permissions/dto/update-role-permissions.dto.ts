import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { FeaturePermissionDto } from '../../roles/dto/feature-permission.dto';

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  badgeIds!: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  confidentialityIds!: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeaturePermissionDto)
  featurePermissions?: FeaturePermissionDto[];
}
