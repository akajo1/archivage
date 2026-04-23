import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  badge_id: string;

  @IsUUID()
  confidentiality_id: string;
}
