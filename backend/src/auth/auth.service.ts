import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /* ── helpers ── */

  private async getDocumentAccesses(role: string) {
    const permission = await this.prisma.rolePermission.findUnique({
      where: { role },
      select: {
        canRead: true,
        canCreate: true,
        canEdit: true,
        featurePermissions: {
          where: { feature: 'documents' },
          select: {
            canRead: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canSearch: true,
          },
          take: 1,
        },
      },
    });

    if (!permission) {
      return [];
    }

    const byFeature = permission.featurePermissions[0];
    if (byFeature) {
      const accesses: Array<'read' | 'create' | 'edit' | 'delete' | 'search'> =
        [];
      if (byFeature.canRead) accesses.push('read');
      if (byFeature.canCreate) accesses.push('create');
      if (byFeature.canEdit) accesses.push('edit');
      if (byFeature.canDelete) accesses.push('delete');
      if (byFeature.canSearch) accesses.push('search');
      return accesses;
    }

    const accesses: Array<'read' | 'create' | 'edit' | 'delete' | 'search'> =
      [];
    if (permission.canRead) accesses.push('read');
    if (permission.canCreate) accesses.push('create');
    if (permission.canEdit) accesses.push('edit');
    return accesses;
  }

  private async getUserPermissions(role: string) {
    const permission = await this.prisma.rolePermission.findUnique({
      where: { role },
      include: {
        badges: { select: { id: true, name: true, color: true } },
        confidentialities: { select: { id: true, level: true } },
        featurePermissions: {
          select: {
            feature: true,
            canRead: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canSearch: true,
          },
          orderBy: { feature: 'asc' },
        },
      },
    });

    if (!permission) {
      return {
        badges: [],
        confidentialities: [],
        featurePermissions: [],
        canRead: false,
        canCreate: false,
        canEdit: false,
      };
    }

    return {
      badges: permission.badges,
      confidentialities: permission.confidentialities,
      featurePermissions: permission.featurePermissions,
      canRead: permission.canRead,
      canCreate: permission.canCreate,
      canEdit: permission.canEdit,
    };
  }

  private signAccessToken(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') ??
        '15m') as unknown as number,
    });
  }

  private signRefreshToken(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        '7d') as unknown as number,
    });
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    role: string;
    name: string;
  }) {
    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const documentAccesses = await this.getDocumentAccesses(user.role);
    const userPermissions = await this.getUserPermissions(user.role);

    return {
      access_token: this.signAccessToken(tokenPayload),
      refresh_token: this.signRefreshToken(tokenPayload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        documentAccesses,
        userPermissions,
      },
    };
  }

  /* ── public methods ── */

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Cet email est déjà utilisé.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Identifiants invalides.');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides.');

    return this.buildAuthResponse(user);
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    const documentAccesses = await this.getDocumentAccesses(user.role);
    const userPermissions = await this.getUserPermissions(user.role);
    return {
      ...user,
      documentAccesses,
      userPermissions,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success to avoid email enumeration
    if (!user) {
      return {
        message:
          'Si cet email existe, un lien de réinitialisation a été envoyé.',
      };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: expiry,
      },
    });

    // In production, send an email with the reset link.
    // For development, we log the token to console.
    const resetUrl = `${this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    console.log(`[DEV] Password reset link for ${user.email}: ${resetUrl}`);

    return {
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      // Remove resetUrl from response in production
      resetUrl,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré.');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid)
      throw new UnauthorizedException('Mot de passe actuel incorrect.');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Mot de passe modifié avec succès.' };
  }
}
