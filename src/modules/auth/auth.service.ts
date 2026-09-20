import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from '../school/entities/school.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { SchoolMembership } from './entities/school-membership.entity.js';
import { PlatformRole, UserAccount } from './entities/user-account.entity.js';

export interface AuthClaims {
  sub: string;
  membershipId?: string;
  schoolId?: string;
  role?: string;
  tokenVersion: number;
  platformRoles?: PlatformRole[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserAccount) private readonly users: Repository<UserAccount>,
    @InjectRepository(SchoolMembership) private readonly memberships: Repository<SchoolMembership>,
    @InjectRepository(School) private readonly schools: Repository<School>,
  ) {}

  async login(dto: LoginDto) {
    const school = await this.schools.findOneBy({ schoolCode: dto.schoolCode, verificationStatus: 'VERIFIED' });
    if (!school) throw new UnauthorizedException('Invalid school or credentials');
    const membership = await this.memberships.findOneBy({ schoolId: school.id, loginIdentifier: dto.identifier, isActive: true });
    if (!membership) throw new UnauthorizedException('Invalid school or credentials');
    const user = await this.users.createQueryBuilder('user').addSelect('user.passwordHash').where('user.id = :id', { id: membership.userId }).getOne();
    if (!user || !user.isActive || !this.verifyPassword(dto.password, user.passwordHash)) throw new UnauthorizedException('Invalid school or credentials');
    return this.issueTokens(user, membership);
  }

  async superAdminLogin(email: string, password: string) {
    const user = await this.users.createQueryBuilder('user').addSelect('user.passwordHash').where('user.email = :email', { email }).getOne();
    if (!user || !user.isActive || !user.platformRoles.includes(PlatformRole.SUPER_ADMIN) || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const claims = this.verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-secret');
      const user = await this.users.findOneBy({ id: claims.sub, isActive: true, tokenVersion: claims.tokenVersion });
      if (!user) throw new UnauthorizedException();
      const membership = claims.membershipId ? await this.memberships.findOneBy({ id: claims.membershipId, isActive: true }) : undefined;
      if (claims.membershipId && (!membership || membership.userId !== user.id)) throw new UnauthorizedException();
      return this.issueTokens(user, membership ?? undefined);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateAccessToken(token: string): Promise<AuthClaims> {
    try {
      const claims = this.verifyToken(token, process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret');
      const user = await this.users.findOneBy({ id: claims.sub, isActive: true, tokenVersion: claims.tokenVersion });
      if (!user) throw new Error('Inactive user');
      if (claims.membershipId) {
        const membership = await this.memberships.findOneBy({ id: claims.membershipId, userId: user.id, schoolId: claims.schoolId, isActive: true });
        if (!membership || membership.role !== claims.role) throw new Error('Inactive membership');
      }
      return claims;
    }
    catch { throw new UnauthorizedException('Invalid access token'); }
  }

  private async issueTokens(user: UserAccount, membership?: SchoolMembership) {
    const claims: AuthClaims = { sub: user.id, membershipId: membership?.id, schoolId: membership?.schoolId, role: membership?.role, tokenVersion: user.tokenVersion, platformRoles: user.platformRoles };
    return {
      accessToken: this.signToken(claims, process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret', 900),
      refreshToken: this.signToken(claims, process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-secret', 604800),
      membership: membership && { id: membership.id, schoolId: membership.schoolId, role: membership.role },
    };
  }

  static hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const calculated = scryptSync(password, salt, 64);
    return timingSafeEqual(calculated, Buffer.from(hash, 'hex'));
  }

  private signToken(claims: AuthClaims, secret: string, expiresInSeconds: number) {
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const header = encode({ alg: 'HS256', typ: 'JWT' });
    const payload = encode({ ...claims, exp: Math.floor(Date.now() / 1000) + expiresInSeconds });
    const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${signature}`;
  }

  private verifyToken(token: string, secret: string): AuthClaims {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) throw new Error('Malformed token');
    const expected = createHmac('sha256', secret).update(`${header}.${payload}`).digest();
    const received = Buffer.from(signature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error('Invalid signature');
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthClaims & { exp?: number };
    if (!claims.sub || !claims.exp || claims.exp < Math.floor(Date.now() / 1000)) throw new Error('Expired token');
    return claims;
  }
}
