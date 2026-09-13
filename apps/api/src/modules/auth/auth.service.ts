import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ConflictException('Ya existe una cuenta con este correo electrónico');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username.toLowerCase() },
    });

    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya se encuentra en uso');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username.toLowerCase(),
        displayName: dto.displayName.trim(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        criticTier: true,
        criticBadge: true,
        createdAt: true,
      },
    });

    const accessToken = this.generateToken(user);

    return {
      message: 'Usuario registrado exitosamente',
      user,
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      criticTier: user.criticTier,
      criticBadge: user.criticBadge,
      createdAt: user.createdAt,
    };

    const accessToken = this.generateToken(sanitizedUser);

    return {
      message: 'Inicio de sesión exitoso',
      user: sanitizedUser,
      accessToken,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        location: true,
        website: true,
        role: true,
        criticTier: true,
        criticBadge: true,
        criticVerifiedAt: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            playLogs: true,
            lists: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async validateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  }) {
    const email = googleProfile.email.toLowerCase();

    // 1. Buscar si ya existe el usuario por googleId
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleProfile.googleId },
    });

    if (user) {
      if (!user.avatarUrl && googleProfile.avatarUrl) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: googleProfile.avatarUrl },
        });
      }
      return {
        user,
        accessToken: this.generateToken(user),
      };
    }

    // 2. Si no existe por googleId, buscar si ya tenía cuenta con el mismo email
    user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleProfile.googleId,
          emailVerified: true,
          avatarUrl: user.avatarUrl || googleProfile.avatarUrl || null,
        },
      });
      return {
        user,
        accessToken: this.generateToken(user),
      };
    }

    // 3. Crear nuevo usuario si no existía
    let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    if (!baseUsername || baseUsername.length < 3) {
      baseUsername = `gamer_${Date.now().toString().slice(-4)}`;
    }

    let username = baseUsername;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    user = await this.prisma.user.create({
      data: {
        email,
        username,
        displayName: googleProfile.displayName || username,
        googleId: googleProfile.googleId,
        avatarUrl: googleProfile.avatarUrl || null,
        emailVerified: true,
        role: 'USER',
      },
    });

    return {
      user,
      accessToken: this.generateToken(user),
    };
  }

  private generateToken(user: {
    id: string;
    email: string;
    username: string;
    role: string;
    criticTier?: string | null;
  }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      criticTier: user.criticTier,
    };

    return this.jwtService.sign(payload);
  }
}
