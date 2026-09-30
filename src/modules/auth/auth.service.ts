import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {ConfigService} from '@nestjs/config';

// entities
import { User, UserRole } from './entities/user.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Guardian } from '../guardian/entities/guardian.entity.js';
import { Teacher } from '../teacher/entities/teacher.entity.js';
import { SchoolMembership,MembershipStatus } from '../school-membership/entities/school-membership.entity.js'
import { RefreshToken } from './entities/refresh-token.entity.js';

// dtos
import { Gender, RegisterStudentDto } from './dto/register-student.dto.js';
import { RegisterTeacherDto } from './dto/register-teacher.dto.js';
import { RegisterGuardianDto } from './dto/register-gurdian.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterSuperAdminDto } from './dto/register-super-admin.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //   Login
  async login(dto: LoginDto) {
    const userRepo = this.dataSource.getRepository(User);

    const user = await userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload,{
      secret: this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      ),
      expiresIn: '7d',
    });

    // Hash and store refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const refreshTokenEntity = this.dataSource
      .getRepository(RefreshToken)
      .create({
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
      });

    await this.dataSource.getRepository(RefreshToken).save(refreshTokenEntity);

    return {
      message: 'login successful',
      accessToken,
      refreshToken,
    };
  }

  // logout
  async logout(userId: string) {
    const userRepo = this.dataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Logout successful',
      userId: user.id,
    };
  }

  // refresh token
  async refresh(refreshToken: string){
    const refreshTokenRepo = this.dataSource.getRepository(RefreshToken);

  //   1.verify refresh  jwt
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      )
    } catch {
      throw new UnauthorizedException('Invalid Or Expired refresh Token.')
    }

  //   2.Get the userId From jwt
    const userId = payload.sub;
    if (!userId) {
      throw new UnauthorizedException(
        'Invalid refresh token.',
      );
    }

  //   3.find all active refresh token for this user
    const storedTokens = await refreshTokenRepo.find({
      where: {
        userId,
        revokedAt: IsNull(),
      },
    });

    if (storedTokens.length === 0) {
      throw new UnauthorizedException(
        'Refresh token has been revoked or does not exist.',
      );
    }

    // 4. Find which stored hash belongs to this refresh token
    let matchedToken: RefreshToken | null = null;

    for (const storedToken of storedTokens) {
      const matches = await bcrypt.compare(
        refreshToken,
        storedToken.tokenHash,
      );

      if (matches) {
        matchedToken = storedToken;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException(
        'Invalid refresh token.',
      );
    }

    // 5. Check database expiry
    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Refresh token has expired.',
      );
    }

    // 6. Get the user
    const userRepo = this.dataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User no longer exists.',
      );
    }

    // 7. Revoke the old refresh token
    matchedToken.revokedAt = new Date();

    await refreshTokenRepo.save(matchedToken);

    // 8. Create new access-token payload
    const newPayload = {
      sub: user.id,
      role: user.role,
    };

    // 9. Generate new access token
    const newAccessToken =
      await this.jwtService.signAsync(newPayload);

    // 10. Generate new refresh token
    const newRefreshToken =
      await this.jwtService.signAsync(newPayload, {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),
        expiresIn: '7d',
      });

    // 11. Hash the new refresh token
    const newRefreshTokenHash =
      await bcrypt.hash(newRefreshToken, 10);

    // 12. Store new refresh token
    const newStoredToken = refreshTokenRepo.create({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ),
      revokedAt: null,
    });

    await refreshTokenRepo.save(newStoredToken);

    // 13. Return new token pair
    return {
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

  }

  // delete account
  async deleteAccount(userId: string) {
    const userRepo = this.dataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await userRepo.remove(user);

    return {
      message: 'Account deleted successfully',
      userId,
    };
  }

  // reset password
  async resetPassword(userId: string, newPassword: string) {
    const userRepo = this.dataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;

    await userRepo.save(user);

    return {
      message: 'Password reset successful',
    };
  }

  //  Register student
  async registerStudent(dto: RegisterStudentDto) {
    //   1. check if email exists
    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (user) {
      throw new BadRequestException('A User with this email already exists.');
    }

    //   2. Hash Password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create a transaction

    return await this.dataSource.transaction(async (manager) => {
      //   3. Create User
      const user = manager.create(User, {
        email: dto.email,
        passwordHash: hashedPassword,
        role: UserRole.STUDENT,
      });
      const savedUser = await manager.save(User, user);

      //   4. Create Student
      const student = manager.create(Student, {
        userId: savedUser.id,
        gender: dto.gender,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        dateOfBirth: dto.dateOfBirth,
        schoolId: dto.schoolId,
      });

      const savedStudent = await manager.save(student);

      // 5.Create school membership
      const membership = manager.create(SchoolMembership, {
        userId: savedUser.id,
        schoolId: dto.schoolId,
        role: UserRole.STUDENT,
        status: MembershipStatus.ACTIVE,
      })

      const savedMembership = await manager.save(SchoolMembership,membership);

      //   6. Return safe response
      return {
        message: 'Student registration successful',
        student: {
          id: savedStudent.id,
          firstName: savedStudent.firstName,
          email: savedStudent.email,
          userId: savedStudent.userId,
          membershipId: savedMembership.id,
        },
      };
    });
  }

  //   Register guardian
  async registerGuardian(dto: RegisterGuardianDto) {
    const userRepo = this.dataSource.getRepository(User);

    const existingUser = await userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email,
        passwordHash: hashedPassword,
        role: UserRole.GUARDIAN,
      });

      const savedUser = await manager.save(User, user);

      const guardian = manager.create(Guardian, {
        userId: savedUser.id,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        schoolId: dto.schoolId,
        phone: dto.phone,
        address: dto.address,
      });

      const savedGuardian = await manager.save(Guardian, guardian);

      // 5.Create school membership
      const membership = manager.create(SchoolMembership, {
        userId: savedUser.id,
        schoolId: dto.schoolId,
        role: UserRole.GUARDIAN,
        status: MembershipStatus.ACTIVE,
      })

      const savedMembership = await manager.save(SchoolMembership,membership);


      return {
        message: 'Guardian registration successful',
        guardian: {
          id: savedGuardian.id,
          membershipId: savedMembership.id,
          name: savedGuardian.firstName,
          userId: savedGuardian.userId,
          email: savedUser.email,
        },
      };
    });
  }

  //   Teacher Registration
  async registerTeacher(dto: RegisterTeacherDto) {
    const userRepo = this.dataSource.getRepository(User);

    const existingUser = await userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email,
        passwordHash: hashedPassword,
        role: UserRole.TEACHER,
      });

      const savedUser = await manager.save(User, user);

      // @ts-ignore
      const teacher = manager.create(Teacher, {
        userId: savedUser.id,
        email: dto.email,
        firstName: dto.firstName,
        lastName:dto.lastName,
        phone:dto.phone,

        schoolId: dto.schoolId,
      });

      const savedTeacher = await manager.save(Teacher, teacher);

      // 5.Create school membership
      const membership = manager.create(SchoolMembership, {
        userId: savedUser.id,
        schoolId: dto.schoolId,
        role: UserRole.TEACHER,
        status: MembershipStatus.ACTIVE,
      })

      const savedMembership = await manager.save(SchoolMembership,membership);


      return {
        message: 'Teacher registration successful',
        teacher: {
          id: savedTeacher.id,
          userId: savedTeacher.userId,
          membershipId: membership.id,
          name: savedTeacher.firstName,

          email: savedUser.email,
        },
      };
    });
  }

//   register super admin
  async registerSuperAdmin(dto: RegisterSuperAdminDto) {
    const userRepo = this.dataSource.getRepository(User);

    const existingUser = await userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'A user with this email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // @ts-ignore
    const user = manager.create(User, {
      email: dto.email,
      passwordHash: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    });

    const savedUser = await userRepo.save(user);

    return {
      message: 'Super admin registration successful',
      user: {
        id: savedUser.id,
        name: savedUser.firstName,
        userId: savedUser.userId,
        email: savedUser.email,
        role: savedUser.role,
      },
    };
  }
}
