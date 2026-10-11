import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { SchoolMembership } from '../../school-membership/entities/school-membership.entity.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @InjectRepository(SchoolMembership)
    private readonly membershipRepo: Repository<SchoolMembership>,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    // 1. What roles does this route require?
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // Route has no @Roles(...)
    if (!requiredRoles) {
      return true;
    }

    // 2. Get authenticated user
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Authenticated user not found.',
      );
    }

    // 3. Get school from URL
    const schoolId = request.params.schoolId;

    if (!schoolId) {
      throw new ForbiddenException(
        'School context is required.',
      );
    }

    // 4. Find user's membership in THIS school
    const membership = await this.membershipRepo.findOne({
      where: {
        userId: user.userId,
        schoolId,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this school.',
      );
    }

    // 5. Check school-specific role
    const hasRole = requiredRoles.includes(
      membership.role,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}