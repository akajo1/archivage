import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Role } from '../common/decorators/roles.decorator';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLog: ActivityLogService,
  ) {}

  private async assertRoleExists(roleKey: string) {
    const role = await this.prisma.appRole.findUnique({
      where: { key: roleKey },
    });
    if (!role) {
      throw new NotFoundException('Role introuvable.');
    }
  }

  private generateTemporaryPassword() {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    return Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        passwordResetRequestedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        passwordResetRequestedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return user;
  }

  async create(
    dto: CreateUserDto,
    actorId?: string,
    actorName?: string,
    actorRole?: string,
  ) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Cet email est deja utilise.');
    }

    const roleKey = dto.role ?? 'user';
    await this.assertRoleExists(roleKey);

    const rawPassword = dto.password;
    const password = await bcrypt.hash(rawPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password,
        role: roleKey,
        mustChangePassword: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        passwordResetRequestedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.activityLog.log({
      action: 'USER_CREATED',
      entity: 'user',
      entityId: user.id,
      entityLabel: user.email,
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
    });

    return {
      ...user,
      temporaryPassword: rawPassword,
    };
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUserId: string,
    currentUserRole: Role,
    currentUserName?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (currentUserRole !== 'admin' && currentUserId !== id) {
      throw new ForbiddenException('Mise a jour non autorisee.');
    }

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException('Cet email est deja utilise.');
      }
    }

    if (dto.role && currentUserRole !== 'admin') {
      throw new ForbiddenException('Seul un admin peut changer les roles.');
    }

    if (dto.role) {
      await this.assertRoleExists(dto.role);
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
    } = {};

    if (dto.name) data.name = dto.name;
    if (dto.email) data.email = dto.email;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.role) data.role = dto.role;

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        passwordResetRequestedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.activityLog.log({
      action: 'USER_UPDATED',
      entity: 'user',
      entityId: updated.id,
      entityLabel: updated.email,
      userId: currentUserId,
      userName: currentUserName,
      userRole: currentUserRole,
    });

    return updated;
  }

  async adminResetPassword(
    id: string,
    currentUserId: string,
    currentUserRole: Role,
    currentUserName?: string,
  ) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenException(
        'Seul un administrateur peut reinitialiser un mot de passe.',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (!user.passwordResetRequestedAt) {
      throw new ForbiddenException(
        "Aucune demande de reinitialisation n'a ete enregistree pour cet utilisateur.",
      );
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        passwordResetRequestedAt: null,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        passwordResetRequestedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.activityLog.log({
      action: 'USER_PASSWORD_RESET_BY_ADMIN',
      entity: 'user',
      entityId: updated.id,
      entityLabel: updated.email,
      userId: currentUserId,
      userName: currentUserName,
      userRole: currentUserRole,
    });

    return {
      ...updated,
      temporaryPassword,
    };
  }

  async remove(
    id: string,
    currentUserId: string,
    currentUserName?: string,
    currentUserRole?: string,
  ) {
    if (id === currentUserId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer votre propre compte.',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    await this.prisma.user.delete({ where: { id } });

    this.activityLog.log({
      action: 'USER_DELETED',
      entity: 'user',
      entityId: id,
      entityLabel: user.email,
      userId: currentUserId,
      userName: currentUserName,
      userRole: currentUserRole,
    });

    return { message: 'Utilisateur supprime.' };
  }
}
