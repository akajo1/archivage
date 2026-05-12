import { IsString, IsOptional, IsArray, IsUUID, IsBoolean } from 'class-validator';

export class CreateRoutingDto {
  @IsUUID()
  documentId!: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ForwardRoutingDto {
  @IsUUID()
  receiverId!: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  ccUserIds?: string[];

  @IsOptional()
  @IsString()
  note?: string;
}

export class VerifyRoutingDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class RejectRoutingDto {
  @IsString()
  rejectionReason!: string;
}

export class AddParticipantDto {
  @IsUUID()
  userId!: string;

  @IsString()
  role!: string;
}

export class AddCommentDto {
  @IsString()
  body!: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}


export class CompleteRoutingDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  archive?: boolean;
}

