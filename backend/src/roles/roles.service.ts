import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SearchRolesDto } from './dto/search-roles.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  private toDocumentAccesses(permission: {
    canRead: boolean;
    canCreate: boolean;
    canEdit: boolean;
  }) {
    const accesses: Array<'read' | 'create' | 'edit'> = [];
    if (permission.canRead) accesses.push('read');
    if (permission.canCreate) accesses.push('create');
    if (permission.canEdit) accesses.push('edit');
    return accesses;
  }

  private toPermissionFlags(accesses: Array<'read' | 'create' | 'edit'>) {
    return {
      canRead: accesses.includes('read'),
      canCreate: accesses.includes('create'),
      canEdit: accesses.includes('edit'),
    };
  }

  findAll(query: SearchRolesDto) {
    const search = query.q?.trim();

    return this.prisma.appRole
      .findMany({
        where: search
          ? {
              OR: [
                { key: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
              ],
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
      })
      .then(async (roles) => {
        const permissions = await this.prisma.rolePermission.findMany({
          where: { role: { in: roles.map((role) => role.key) } },
          include: {
            badges: { select: { id: true, name: true, color: true } },
            confidentialities: { select: { id: true, level: true } },
          },
        });

        return roles.map((role) => {
          const permission = permissions.find((item) => item.role === role.key);
          return {
            ...role,
            badges: permission?.badges ?? [],
            confidentialities: permission?.confidentialities ?? [],
            documentAccesses: permission
              ? this.toDocumentAccesses(permission)
              : ['read'],
          };
        });
      });
  }

  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.appRole.findUnique({
      where: { key: dto.key },
    });
    if (exists) {
      throw new ConflictException('Ce role existe deja.');
    }

    if (
      (dto.badgeIds?.length ?? 0) === 0 ||
      (dto.confidentialityIds?.length ?? 0) === 0
    ) {
      throw new BadRequestException(
        'Vous devez attribuer au moins un badge et une confidentialite au role.',
      );
    }

    const role = await this.prisma.appRole.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
      },
    });

    await this.prisma.rolePermission.create({
      data: {
        role: role.key,
        badges: { connect: dto.badgeIds!.map((id) => ({ id })) },
        confidentialities: {
          connect: dto.confidentialityIds!.map((id) => ({ id })),
        },
        ...this.toPermissionFlags(dto.documentAccesses),
      },
    });

    return this.findOne(role.id);
  }

  async findOne(id: string) {
    const role = await this.prisma.appRole.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException('Role introuvable.');
    }

    const permissions = await this.prisma.rolePermission.findUnique({
      where: { role: role.key },
      include: {
        badges: { select: { id: true, name: true, color: true } },
        confidentialities: { select: { id: true, level: true } },
      },
    });

    return {
      ...role,
      badges: permissions?.badges ?? [],
      confidentialities: permissions?.confidentialities ?? [],
      documentAccesses: permissions
        ? this.toDocumentAccesses(permissions)
        : ['read'],
    };
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.appRole.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role introuvable.');
    }

    if (dto.key && dto.key !== role.key) {
      const keyExists = await this.prisma.appRole.findUnique({
        where: { key: dto.key },
      });
      if (keyExists) {
        throw new ConflictException('Ce role existe deja.');
      }
    }

    const updatedRole = await this.prisma.appRole.update({
      where: { id },
      data: {
        ...(dto.key ? { key: dto.key } : {}),
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
      },
    });

    const permission = await this.prisma.rolePermission.findUnique({
      where: { role: role.key },
    });

    const permissionRoleKey = dto.key ?? role.key;

    if (permission) {
      await this.prisma.rolePermission.update({
        where: { role: role.key },
        data: {
          ...(dto.key ? { role: dto.key } : {}),
          ...(dto.badgeIds
            ? {
                badges: {
                  set: dto.badgeIds.map((badgeId) => ({ id: badgeId })),
                },
              }
            : {}),
          ...(dto.confidentialityIds
            ? {
                confidentialities: {
                  set: dto.confidentialityIds.map((confidentialityId) => ({
                    id: confidentialityId,
                  })),
                },
              }
            : {}),
          ...(dto.documentAccesses
            ? this.toPermissionFlags(dto.documentAccesses)
            : {}),
        },
      });
    } else if (dto.badgeIds && dto.confidentialityIds) {
      await this.prisma.rolePermission.create({
        data: {
          role: permissionRoleKey,
          badges: { connect: dto.badgeIds.map((badgeId) => ({ id: badgeId })) },
          confidentialities: {
            connect: dto.confidentialityIds.map((confidentialityId) => ({
              id: confidentialityId,
            })),
          },
          ...this.toPermissionFlags(dto.documentAccesses ?? ['read']),
        },
      });
    }

    if (dto.key && dto.key !== role.key) {
      await this.prisma.user.updateMany({
        where: { role: role.key },
        data: { role: dto.key },
      });
    }

    return this.findOne(updatedRole.id);
  }

  async remove(id: string) {
    const role = await this.prisma.appRole.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role introuvable.');
    }

    if (['admin', 'manager', 'user'].includes(role.key)) {
      throw new BadRequestException(
        'Les roles systeme ne peuvent pas etre supprimes.',
      );
    }

    const inUse = await this.prisma.user.count({ where: { role: role.key } });
    if (inUse > 0) {
      throw new BadRequestException('Ce role est attribue a des utilisateurs.');
    }

    await this.prisma.rolePermission.deleteMany({ where: { role: role.key } });
    await this.prisma.appRole.delete({ where: { id } });

    return { message: 'Role supprime.' };
  }
}
