import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import type { Role } from '../common/decorators/roles.decorator';

const ROLE_ALLOWED_LEVELS: Record<Role, string[]> = {
  admin: ['public', 'interne', 'confidentiel', 'secret'],
  manager: ['public', 'interne', 'confidentiel'],
  user: ['public'],
};

type AccessRules = {
  allowedLevels: string[];
  allowedBadgeIds?: string[];
  allowedConfidentialityIds?: string[];
};

const include = {
  badge: true,
  confidentiality: true,
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  attachments: true,
};

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  private async getAccessRules(role: Role): Promise<AccessRules> {
    const permission = await this.prisma.rolePermission.findUnique({
      where: { role },
      include: {
        badges: { select: { id: true } },
        confidentialities: { select: { id: true, level: true } },
      },
    });

    if (!permission) {
      return {
        allowedLevels: ROLE_ALLOWED_LEVELS[role],
      };
    }

    return {
      allowedLevels: permission.confidentialities.map((c) => c.level),
      allowedBadgeIds: permission.badges.map((b) => b.id),
      allowedConfidentialityIds: permission.confidentialities.map((c) => c.id),
    };
  }

  async findAll(
    userId: string,
    role: Role,
    filters: {
      badge_id?: string;
      confidentiality_id?: string;
      search?: string;
    },
  ) {
    const accessRules = await this.getAccessRules(role);

    return this.prisma.document.findMany({
      where: {
        confidentiality: { level: { in: accessRules.allowedLevels as any } },
        ...(accessRules.allowedBadgeIds
          ? { badgeId: { in: accessRules.allowedBadgeIds } }
          : {}),
        ...(accessRules.allowedConfidentialityIds
          ? { confidentialityId: { in: accessRules.allowedConfidentialityIds } }
          : {}),
        ...(filters.badge_id ? { badgeId: filters.badge_id } : {}),
        ...(filters.confidentiality_id
          ? { confidentialityId: filters.confidentiality_id }
          : {}),
        ...(filters.search
          ? { title: { contains: filters.search } }
          : {}),
      },
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, role: Role) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include,
    });
    if (!doc) throw new NotFoundException('Document introuvable.');

    const accessRules = await this.getAccessRules(role);

    if (!accessRules.allowedLevels.includes(doc.confidentiality.level)) {
      throw new ForbiddenException('Accès refusé à ce document.');
    }

    if (
      accessRules.allowedBadgeIds &&
      !accessRules.allowedBadgeIds.includes(doc.badgeId)
    ) {
      throw new ForbiddenException('Accès refusé à ce document.');
    }

    if (
      accessRules.allowedConfidentialityIds &&
      !accessRules.allowedConfidentialityIds.includes(doc.confidentialityId)
    ) {
      throw new ForbiddenException('Accès refusé à ce document.');
    }

    return doc;
  }

  async create(
    userId: string,
    role: Role,
    dto: CreateDocumentDto,
    fileUrl?: string,
  ) {
    const hasFile = Boolean(fileUrl);
    const hasContent = Boolean(dto.content?.trim());

    if ((hasFile && hasContent) || (!hasFile && !hasContent)) {
      throw new BadRequestException(
        'Vous devez choisir un seul mode: uploader un fichier ou saisir le contenu.',
      );
    }

    const accessRules = await this.getAccessRules(role);
    if (
      accessRules.allowedBadgeIds &&
      !accessRules.allowedBadgeIds.includes(dto.badge_id)
    ) {
      throw new ForbiddenException(
        'Ce role ne peut pas attribuer ce badge au document.',
      );
    }

    if (
      accessRules.allowedConfidentialityIds &&
      !accessRules.allowedConfidentialityIds.includes(dto.confidentiality_id)
    ) {
      throw new ForbiddenException(
        'Ce role ne peut pas utiliser ce niveau de confidentialite.',
      );
    }

    return this.prisma.document.create({
      data: {
        title: dto.title,
        reference: dto.reference ?? null,
        description: dto.description ?? null,
        content: hasContent ? dto.content! : null,
        fileUrl: hasFile ? fileUrl! : null,
        createdById: userId,
        badgeId: dto.badge_id,
        confidentialityId: dto.confidentiality_id,
      },
      include,
    });
  }

  async update(
    id: string,
    userId: string,
    role: Role,
    dto: UpdateDocumentDto,
    fileUrl?: string,
  ) {
    const accessRules = await this.getAccessRules(role);
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable.');
    if (role !== 'admin' && doc.createdById !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres documents.',
      );
    }

    const hasNewFile = Boolean(fileUrl);
    const hasContentField = dto.content !== undefined;
    const hasNewContent = Boolean(dto.content?.trim());

    if (hasNewFile && hasNewContent) {
      throw new BadRequestException(
        'Vous ne pouvez pas envoyer un fichier principal et un contenu texte en meme temps.',
      );
    }

    if (
      dto.badge_id &&
      accessRules.allowedBadgeIds &&
      !accessRules.allowedBadgeIds.includes(dto.badge_id)
    ) {
      throw new ForbiddenException(
        'Ce role ne peut pas attribuer ce badge au document.',
      );
    }

    if (
      dto.confidentiality_id &&
      accessRules.allowedConfidentialityIds &&
      !accessRules.allowedConfidentialityIds.includes(dto.confidentiality_id)
    ) {
      throw new ForbiddenException(
        'Ce role ne peut pas utiliser ce niveau de confidentialite.',
      );
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.reference !== undefined ? { reference: dto.reference } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(hasContentField ? { content: hasNewContent ? dto.content : null } : {}),
        ...(dto.badge_id ? { badgeId: dto.badge_id } : {}),
        ...(dto.confidentiality_id
          ? { confidentialityId: dto.confidentiality_id }
          : {}),
        ...(hasNewFile ? { fileUrl } : {}),
        ...(hasNewFile ? { content: null } : {}),
        ...(hasNewContent ? { fileUrl: null } : {}),
      },
      include,
    });
  }

  async addAttachments(
    documentId: string,
    role: Role,
    files: Express.Multer.File[],
  ) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document introuvable.');

    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    await this.prisma.documentAttachment.createMany({
      data: files.map((f) => ({
        documentId,
        fileUrl: `/uploads/${f.filename}`,
        fileName: f.originalname,
        fileSize: f.size,
        mimeType: f.mimetype,
      })),
    });

    return this.prisma.document.findUnique({ where: { id: documentId }, include });
  }

  async removeAttachment(documentId: string, attachmentId: string, _role: Role) {
    const attachment = await this.prisma.documentAttachment.findFirst({
      where: { id: attachmentId, documentId },
    });
    if (!attachment) throw new NotFoundException('Pièce jointe introuvable.');
    await this.prisma.documentAttachment.delete({ where: { id: attachmentId } });
    return { message: 'Pièce jointe supprimée.' };
  }

  async remove(id: string, userId: string, role: Role) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable.');
    if (role !== 'admin' && doc.createdById !== userId) {
      throw new ForbiddenException('Suppression non autorisée.');
    }
    await this.prisma.document.delete({ where: { id } });
    return { message: 'Document supprimé.' };
  }
}
