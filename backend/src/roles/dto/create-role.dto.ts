import {
  IsArray,
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  IsUUID,
  Matches,
} from 'class-validator';

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

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['read', 'create', 'edit'], { each: true })
  documentAccesses!: Array<'read' | 'create' | 'edit'>;
}
