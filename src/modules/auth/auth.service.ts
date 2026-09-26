import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// entities
import { User, UserRole } from './entities/user.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Guardian } from '../guardian/entities/guardian.entity.js';
import { Teacher } from '../teacher/entities/teacher.entity.js';
import { SchoolMembership,MembershipStatus } from '../school-membership/entities/school-membership.entity.js'

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
  ) {}

  //   Login
  async login(dto: LoginDto) {
    const userRepo = this.dataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or Password!');
    }

    // Verify password
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return {
      message: 'login successful',
      accessToken,
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
        role: UserRole.STUDENT,
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
        role: UserRole.STUDENT,
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
      password: hashedPassword,
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
