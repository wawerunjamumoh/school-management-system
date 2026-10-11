import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { EventService } from './event.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(
    private readonly eventService: EventService,
  ) {}

  // ==========================================
  // CREATE EVENT
  // ==========================================

  // POST /schools/:schoolId/events
  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  async createEvent(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventService.create(
      schoolId,
      dto,
    );
  }

  // ==========================================
  // GET ALL EVENTS
  // ==========================================

  // GET /schools/:schoolId/events
  @Get()
  async findAllEvents(
    @Param('schoolId') schoolId: string,
  ) {
    return this.eventService.findAll(schoolId);
  }

  // ==========================================
  // GET EVENTS BY ACADEMIC YEAR
  // ==========================================

  // GET /schools/:schoolId/events/academic-year/:academicYearId
  @Get('academic-year/:academicYearId')
  async getSchoolEventsForYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.eventService.findByAcademicYear(
      schoolId,
      academicYearId,
    );
  }

  // ==========================================
  // GET EVENTS BY ACADEMIC YEAR + TERM
  // ==========================================

  // GET /schools/:schoolId/events/academic-year/:academicYearId/term/:termId
  @Get('academic-year/:academicYearId/term/:termId')
  async getSchoolEventsForYearAndTerm(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
    @Param('termId') termId: string,
  ) {
    return this.eventService.findByAcademicYearAndTerm(
      schoolId,
      academicYearId,
      termId,
    );
  }

  // ==========================================
  // GET ONE EVENT
  // ==========================================

  // GET /schools/:schoolId/events/:eventId
  @Get(':eventId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.eventService.findOne(
      schoolId,
      eventId,
    );
  }

  // ==========================================
  // UPDATE
  // ==========================================

  // PATCH /schools/:schoolId/events/:eventId
  @Patch(':eventId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  async update(
    @Param('schoolId') schoolId: string,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(
      schoolId,
      eventId,
      dto,
    );
  }

  // ==========================================
  // DELETE
  // ==========================================

  // DELETE /schools/:schoolId/events/:eventId
  @Delete(':eventId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.eventService.remove(
      schoolId,
      eventId,
    );
  }
}

