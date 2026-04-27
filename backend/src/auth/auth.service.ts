import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ROLE_FEATURES } from '../roles/dto/feature-permission.dto';

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
      if (role === 'admin' || role === 'manager')
        return ['read', 'create', 'edit', 'delete', 'search'];
      return ['read'];
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
    if (role === 'admin') {
      const [allBadges, allConfidentialities] = await Promise.all([
        this.prisma.badge.findMany({
          select: { id: true, name: true, color: true },
        }),
        this.prisma.confidentiality.findMany({
          select: { id: true, level: true },
        }),
      ]);

      return {
        badges: allBadges,
        confidentialities: allConfidentialities,
        featurePermissions: ROLE_FEATURES.map((feature) => ({
          feature,
          canRead: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canSearch: true,
        })),
        canRead: true,
        canCreate: true,
        canEdit: true,
      };
    }

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

    // Handle default permissions when no explicit role permission exists.
    if (!permission) {
      if (role === 'manager') {
        const allBadges = await this.prisma.badge.findMany({
          select: { id: true, name: true, color: true },
        });
        const allConfidentialities = await this.prisma.confidentiality.findMany(
          {
            select: { id: true, level: true },
          },
        );
        return {
          badges: allBadges,
          confidentialities: allConfidentialities,
          featurePermissions: [
            {
              feature: 'dashboard',
              canRead: true,
              canCreate: true,
              canEdit: true,
              canDelete: true,
              canSearch: true,
            },
            {
              feature: 'documents',
              canRead: true,
              canCreate: true,
              canEdit: true,
              canDelete: true,
              canSearch: true,
            },
            {
              feature: 'users',
              canRead: true,
              canCreate: true,
              canEdit: true,
              canDelete: true,
              canSearch: true,
            },
            {
              feature: 'roles',
              canRead: true,
              canCreate: true,
              canEdit: true,
              canDelete: true,
              canSearch: true,
            },
            {
              feature: 'badges',
              canRead: true,
              canCreate: true,
              canEdit: true,
              canDelete: true,
              canSearch: true,
            },
            {
              feature: 'confidentiality',
              canRead: true,
              canCreate: true,
              canEdit: true,
              canDelete: true,
              canSearch: true,
            },
          ],
          canRead: true,
          canCreate: true,
          canEdit: true,
        };
      }
      return {
        badges: [],
        confidentialities: [],
        featurePermissions: [],
        canRead: true,
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
}
