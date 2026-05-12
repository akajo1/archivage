import { IsString, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RoutingTemplateStepDto {
  @IsString()
  role!: string;
}

export class CreateRoutingTemplateDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingTemplateStepDto)
  steps!: RoutingTemplateStepDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateRoutingTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingTemplateStepDto)
  steps?: RoutingTemplateStepDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

