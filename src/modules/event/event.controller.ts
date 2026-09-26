import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { EventService } from './event.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';

@Controller('schools/:schoolId/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // ==========================================
  // CREATE EVENT
  // ==========================================

  @Post()
  async createEvent(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventService.create(schoolId, dto);
  }

  // ==========================================
  // GET ALL EVENTS
  // ==========================================

  @Get()
  async findAllEvents(@Param('schoolId') schoolId: string) {
    return this.eventService.findAll(schoolId);
  }

  // ==========================================
  // GET EVENTS BY ACADEMIC YEAR
  // ==========================================

  @Get('academic-year/:academicYearId')
  async getSchoolEventsForYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.eventService.findByAcademicYear(schoolId, academicYearId);
  }

  // ==========================================
  // GET EVENTS BY ACADEMIC YEAR + TERM
  // ==========================================

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

  @Get(':eventId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.eventService.findOne(schoolId, eventId);
  }

  // ==========================================
  // UPDATE
  // ==========================================

  @Patch(':eventId')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(schoolId, eventId, dto);
  }

  // ==========================================
  // DELETE
  // ==========================================

  @Delete(':eventId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.eventService.remove(schoolId, eventId);
  }
}
