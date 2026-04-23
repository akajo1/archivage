import { IsOptional, IsString } from 'class-validator';

export class SearchRolesDto {
  @IsOptional()
  @IsString()
  q?: string;
}
