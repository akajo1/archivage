import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeaturePermissionDto } from './feature-permission.dto';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z][a-z0-9_-]{1,30}$/)
  key!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  badgeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  confidentialityIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeaturePermissionDto)
  featurePermissions?: FeaturePermissionDto[];
}
