import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

type Role = 'admin' | 'manager' | 'user';

const ROLE_ALLOWED_LEVELS: Record<Role, string[]> = {
  admin: ['public', 'interne', 'confidentiel', 'secret'],
  manager: ['public', 'interne', 'confidentiel'],
  user: ['public'],
};

const include = {
  badge: true,
  confidentiality: true,
  createdBy: { select: { id: true, name: true, email: true, role: true } },
};

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    role: Role,
    filters: {
      badge_id?: string;
      confidentiality_id?: string;
      search?: string;
    },
  ) {
    const allowedLevels = ROLE_ALLOWED_LEVELS[role];

    return this.prisma.document.findMany({
      where: {
        confidentiality: { level: { in: allowedLevels as any } },
        ...(filters.badge_id ? { badgeId: filters.badge_id } : {}),
        ...(filters.confidentiality_id
          ? { confidentialityId: filters.confidentiality_id }
          : {}),
        ...(filters.search
          ? { title: { contains: filters.search, mode: 'insensitive' } }
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

    const allowedLevels = ROLE_ALLOWED_LEVELS[role];
    if (!allowedLevels.includes(doc.confidentiality.level)) {
      throw new ForbiddenException('Accès refusé à ce document.');
    }
    return doc;
  }

  async create(userId: string, dto: CreateDocumentDto, fileUrl?: string) {
    return this.prisma.document.create({
      data: {
        title: dto.title,
        fileUrl: fileUrl ?? null,
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
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable.');
    if (role !== 'admin' && doc.createdById !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres documents.',
      );
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.badge_id ? { badgeId: dto.badge_id } : {}),
        ...(dto.confidentiality_id
          ? { confidentialityId: dto.confidentiality_id }
          : {}),
        ...(fileUrl ? { fileUrl } : {}),
      },
      include,
    });
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
