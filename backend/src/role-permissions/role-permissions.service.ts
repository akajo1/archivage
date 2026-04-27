import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Role } from '../common/decorators/roles.decorator';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { ROLE_FEATURES } from '../roles/dto/feature-permission.dto';

const toDocumentLegacyAccess = (
  featurePermissions: UpdateRolePermissionsDto['featurePermissions'],
) => {
  const documents = featurePermissions?.find((item) => item.feature === 'documents');
  if (!documents) return null;

  return {
    canRead: documents.canRead,
    canCreate: documents.canEdit,
    canEdit: documents.canEdit,
  };
};

@Injectable()
export class RolePermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const [roles, permissions, badges, confidentialities] = await Promise.all([
      this.prisma.appRole.findMany({
        select: { key: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.rolePermission.findMany({
        include: {
          badges: { select: { id: true, name: true, color: true } },
          confidentialities: { select: { id: true, level: true } },
          featurePermissions: {
            select: {
              feature: true,
              canRead: true,
              canEdit: true,
              canDelete: true,
              canSearch: true,
            },
            orderBy: { feature: 'asc' },
          },
        },
      }),
      this.prisma.badge.findMany({
        select: { id: true, name: true, color: true },
      }),
      this.prisma.confidentiality.findMany({
        select: { id: true, level: true },
      }),
    ]);

    return roles.map((roleEntry) => {
      const permission = permissions.find((p) => p.role === roleEntry.key);
      return {
        role: roleEntry.key,
        badges: permission?.badges ?? badges,
        confidentialities: permission?.confidentialities ?? confidentialities,
          featurePermissions: permission?.featurePermissions ?? [],
      };
    });
  }

  async update(role: Role, dto: UpdateRolePermissionsDto) {
    const roleExists = await this.prisma.appRole.findUnique({
      where: { key: role },
    });
    if (!roleExists) {
      throw new NotFoundException('Role introuvable.');
    }

    const [badgeCount, confidentialityCount] = await Promise.all([
      this.prisma.badge.count({ where: { id: { in: dto.badgeIds } } }),
      this.prisma.confidentiality.count({
        where: { id: { in: dto.confidentialityIds } },
      }),
    ]);

    if (badgeCount !== dto.badgeIds.length) {
      throw new NotFoundException('Certains badges sont introuvables.');
    }

    if (confidentialityCount !== dto.confidentialityIds.length) {
      throw new NotFoundException(
        'Certains niveaux de confidentialite sont introuvables.',
      );
    }

    if (dto.badgeIds.length === 0 || dto.confidentialityIds.length === 0) {
      throw new BadRequestException(
        'Un role doit avoir au moins un badge et un niveau de confidentialite.',
      );
    }

    const normalizedFeaturePermissions =
      role === 'admin'
        ? ROLE_FEATURES.map((feature) => ({
            feature,
            canRead: true,
            canEdit: true,
            canDelete: true,
            canSearch: true,
          }))
        : dto.featurePermissions;

    const legacyAccess = toDocumentLegacyAccess(normalizedFeaturePermissions);
    const forcedLegacyAccess =
      role === 'admin'
        ? {
            canRead: true,
            canCreate: true,
            canEdit: true,
          }
        : (legacyAccess ?? {});

    const updated = await this.prisma.rolePermission.upsert({
      where: { role },
      update: {
        badges: { set: dto.badgeIds.map((id) => ({ id })) },
        confidentialities: {
          set: dto.confidentialityIds.map((id) => ({ id })),
        },
        ...forcedLegacyAccess,
        ...(normalizedFeaturePermissions
          ? {
              featurePermissions: {
                deleteMany: {},
                create: normalizedFeaturePermissions,
              },
            }
          : {}),
      },
      create: {
        role,
        ...forcedLegacyAccess,
        badges: { connect: dto.badgeIds.map((id) => ({ id })) },
        confidentialities: {
          connect: dto.confidentialityIds.map((id) => ({ id })),
        },
        ...(normalizedFeaturePermissions
          ? {
              featurePermissions: {
                create: normalizedFeaturePermissions,
              },
            }
          : {}),
      },
      include: {
        badges: { select: { id: true, name: true, color: true } },
        confidentialities: { select: { id: true, level: true } },
        featurePermissions: {
          select: {
            feature: true,
            canRead: true,
            canEdit: true,
            canDelete: true,
            canSearch: true,
          },
          orderBy: { feature: 'asc' },
        },
      },
    });

    return {
      role: updated.role,
      badges: updated.badges,
      confidentialities: updated.confidentialities,
      featurePermissions: updated.featurePermissions,
    };
  }
}
