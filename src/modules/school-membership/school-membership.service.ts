import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DataSource,DeepPartial } from 'typeorm';

import {
  SchoolMembership,
  MembershipStatus,
} from './entities/school-membership.entity.js';

import { User,UserRole } from '../auth/entities/user.entity.js';
import { School } from '../school/entities/school.entity.js';

import { CreateSchoolMembershipDto } from './dto/create-school-membership.dto.js';
import { UpdateSchoolMembershipDto } from './dto/update-school-membership.dto.js';

@Injectable()
export class SchoolMembershipService {
  constructor(private readonly dataSource: DataSource) {}

  // ==========================================
  // CREATE
  // ==========================================

  async create(schoolId: string, dto: CreateSchoolMembershipDto) {
    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const userRepository = this.dataSource.getRepository(User);

    const schoolRepository = this.dataSource.getRepository(School);

    // 1. Check school
    const school = await schoolRepository.findOne({
      where: {
        id: schoolId,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    // 2. Check user
    const user = await userRepository.findOne({
      where: {
        id: dto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Prevent duplicate membership
    const existingMembership = await membershipRepository.findOne({
      where: {
        userId: dto.userId,
        schoolId,
      },
    });

    if (existingMembership) {
      throw new BadRequestException(
        'User already has a membership in this school',
      );
    }

    // 4. Create membership
    const membership = membershipRepository.create({
      userId: dto.userId,
      schoolId,
      role: dto.role as unknown as UserRole,
      status: dto.status ?? MembershipStatus.PENDING,
    } as DeepPartial<SchoolMembership>);

    const savedMembership = await membershipRepository.save(membership);

    return {
      message: 'School membership created successfully',
      membership: savedMembership,
    };
  }

  // ==========================================
  // FIND MEMBERSHIPS OF SCHOOL
  // ==========================================

  async findBySchool(schoolId: string) {
    const schoolRepository = this.dataSource.getRepository(School);

    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const school = await schoolRepository.findOne({
      where: {
        id: schoolId,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return membershipRepository.find({
      where: {
        schoolId,
      },
      relations: {
        user: true,
      },
    });
  }

  // ==========================================
  // FIND ONE
  // ==========================================

  async findOne(schoolId: string, membershipId: string) {
    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const membership = await membershipRepository.findOne({
      where: {
        id: membershipId,
        schoolId,
      },
      relations: {
        user: true,
        school: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('School membership not found');
    }

    return membership;
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    schoolId: string,
    membershipId: string,
    dto: UpdateSchoolMembershipDto,
  ) {
    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const membership = await membershipRepository.findOne({
      where: {
        id: membershipId,
        schoolId,
      },
    });

    if (!membership) {
      throw new NotFoundException('School membership not found');
    }

    Object.assign(membership, dto);

    const updatedMembership = await membershipRepository.save(membership);

    return {
      message: 'School membership updated successfully',
      membership: updatedMembership,
    };
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(schoolId: string, membershipId: string) {
    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const membership = await membershipRepository.findOne({
      where: {
        id: membershipId,
        schoolId,
      },
    });

    if (!membership) {
      throw new NotFoundException('School membership not found');
    }

    await membershipRepository.remove(membership);

    return {
      message: 'School membership deleted successfully',
      membershipId,
    };
  }

  // ==========================================
  // FIND MEMBERSHIPS OF USER
  // ==========================================

  async findByUser(userId: string) {
    const userRepository = this.dataSource.getRepository(User);

    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return membershipRepository.find({
      where: {
        userId,
      },
      relations: {
        school: true,
      },
    });
  }
}
