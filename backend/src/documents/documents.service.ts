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
import { ActivityLogService } from '../activity-log/activity-log.service';

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
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
  ) {}

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

  private async canSearchDocuments(role: Role): Promise<boolean> {
    const permission = await this.prisma.rolePermission.findUnique({
      where: { role },
      include: {
        featurePermissions: {
          where: { feature: 'documents' },
          select: { canSearch: true },
          take: 1,
        },
      },
    });

    return permission?.featurePermissions[0]?.canSearch ?? false;
  }

  async findAll(
    userId: string,
    role: Role,
    filters: {
      badge_id?: string;
      confidentiality_id?: string;
      search?: string;
      status?: string;
      exclude_archived?: boolean;
    },
  ) {
    const searchTerm = filters.search?.trim();
    if (searchTerm && !(await this.canSearchDocuments(role))) {
      throw new ForbiddenException(
        'Recherche non autorisee pour cette fonctionnalite.',
      );
    }

    const accessRules = await this.getAccessRules(role);

    // Build status filter
    let statusFilter: object | undefined;
    if (filters.status) {
      statusFilter = { status: filters.status };
    } else if (filters.exclude_archived) {
      statusFilter = { status: { not: 'archived' } };
    }

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
        ...(searchTerm
          ? { title: { contains: searchTerm } }
          : {}),
        ...(statusFilter ?? {}),
      },
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, role: Role, userId?: string, userName?: string) {
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

    if (userId) {
      this.activityLog.log({
        action: 'DOCUMENT_VIEWED',
        entity: 'document',
        entityId: doc.id,
        entityLabel: doc.title,
        userId,
        userName,
        userRole: role,
      });
    }

    return doc;
  }

  async create(
    userId: string,
    role: Role,
    dto: CreateDocumentDto,
    fileUrl?: string,
    userName?: string,
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

    const doc = await this.prisma.document.create({
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

    this.activityLog.log({
      action: 'DOCUMENT_CREATED',
      entity: 'document',
      entityId: doc.id,
      entityLabel: doc.title,
      userId,
      userName,
      userRole: role,
    });

    return doc;
  }

  async update(
    id: string,
    userId: string,
    role: Role,
    dto: UpdateDocumentDto,
    fileUrl?: string,
    userName?: string,
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

    const updated = await this.prisma.document.update({
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

    this.activityLog.log({
      action: 'DOCUMENT_UPDATED',
      entity: 'document',
      entityId: updated.id,
      entityLabel: updated.title,
      userId,
      userName,
      userRole: role,
    });

    return updated;
  }

  async addAttachments(
    documentId: string,
    role: Role,
    files: Express.Multer.File[],
    userId?: string,
    userName?: string,
  ) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document introuvable.');

    await this.prisma.documentAttachment.createMany({
      data: files.map((f) => ({
        documentId,
        fileUrl: `/uploads/${f.filename}`,
        fileName: f.originalname,
        fileSize: f.size,
        mimeType: f.mimetype,
      })),
    });

    if (userId && files.length > 0) {
      this.activityLog.log({
        action: 'ATTACHMENT_ADDED',
        entity: 'document',
        entityId: documentId,
        entityLabel: doc.title,
        userId,
        userName,
        userRole: role,
      });
    }

    return this.prisma.document.findUnique({ where: { id: documentId }, include });
  }

  async removeAttachment(
    documentId: string,
    attachmentId: string,
    role: Role,
    userId?: string,
    userName?: string,
  ) {
    const attachment = await this.prisma.documentAttachment.findFirst({
      where: { id: attachmentId, documentId },
      include: { document: { select: { title: true } } },
    });
    if (!attachment) throw new NotFoundException('Pièce jointe introuvable.');

    await this.prisma.documentAttachment.delete({ where: { id: attachmentId } });

    if (userId) {
      this.activityLog.log({
        action: 'ATTACHMENT_DELETED',
        entity: 'document',
        entityId: documentId,
        entityLabel: attachment.document.title,
        userId,
        userName,
        userRole: role,
      });
    }

    return { message: 'Pièce jointe supprimée.' };
  }

  async archive(id: string, userId: string, role: Role, userName?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable.');
    if (role !== 'admin' && role !== 'manager' && doc.createdById !== userId) {
      throw new ForbiddenException('Archivage non autorisé.');
    }

    const updated = await this.prisma.document.update({
      where: { id },
      data: { status: 'archived' as any },
      include,
    });

    this.activityLog.log({
      action: 'DOCUMENT_ARCHIVED',
      entity: 'document',
      entityId: id,
      entityLabel: doc.title,
      userId,
      userName,
      userRole: role,
    });

    return updated;
  }

  async unarchive(id: string, userId: string, role: Role, userName?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable.');
    if (role !== 'admin' && role !== 'manager' && doc.createdById !== userId) {
      throw new ForbiddenException('Désarchivage non autorisé.');
    }

    const updated = await this.prisma.document.update({
      where: { id },
      data: { status: 'active' as any },
      include,
    });

    this.activityLog.log({
      action: 'DOCUMENT_UNARCHIVED',
      entity: 'document',
      entityId: id,
      entityLabel: doc.title,
      userId,
      userName,
      userRole: role,
    });

    return updated;
  }

  async remove(id: string, userId: string, role: Role, userName?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable.');
    if (role !== 'admin' && doc.createdById !== userId) {
      throw new ForbiddenException('Suppression non autorisée.');
    }
    await this.prisma.document.delete({ where: { id } });

    this.activityLog.log({
      action: 'DOCUMENT_DELETED',
      entity: 'document',
      entityId: id,
      entityLabel: doc.title,
      userId,
      userName,
      userRole: role,
    });

    return { message: 'Document supprimé.' };
  }
}
