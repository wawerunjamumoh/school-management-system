import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './entities/event.entity.js';
import { School } from '../school/entities/school.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { Term } from '../term/entities/term.entity.js';

import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,

    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
  ) {}

  // ==========================================
  // CREATE
  // ==========================================

  async create(
    schoolId: string,
    dto: CreateEventDto,
  ) {
    // ------------------------------------------
    // Validate dates
    // ------------------------------------------

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (endsAt <= startsAt) {
      throw new BadRequestException(
        'Event end time must be after start time',
      );
    }

    // ------------------------------------------
    // Verify school
    // ------------------------------------------

    const school =
      await this.schoolRepository.findOne({
        where: {
          id: schoolId,
        },
      });

    if (!school) {
      throw new NotFoundException(
        'School not found',
      );
    }

    // ------------------------------------------
    // Verify academic year
    // ------------------------------------------

    const academicYear =
      await this.academicYearRepository.findOne({
        where: {
          id: dto.academicYearId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    // ------------------------------------------
    // Verify term
    // ------------------------------------------

    const term =
      await this.termRepository.findOne({
        where: {
          id: dto.termId,
        },
      });

    if (!term) {
      throw new NotFoundException(
        'Term not found',
      );
    }

    // ------------------------------------------
    // Create event
    // ------------------------------------------

    const event = this.eventRepository.create({
      eventName: dto.eventName,
      description: dto.description,
      startsAt,
      endsAt,
      createdBy: dto.createdBy,
      academicYearId: dto.academicYearId,
      termId: dto.termId,
      schoolId,
    });

    return this.eventRepository.save(event);
  }

  // ==========================================
  // FIND ALL SCHOOL EVENTS
  // ==========================================

  async findAll(schoolId: string) {
    return this.eventRepository.find({
      where: {
        schoolId,
      },
      relations: {
        academicYear: true,
        term: true,
      },
      order: {
        startsAt: 'ASC',
      },
    });
  }

  // ==========================================
  // FIND ONE
  // ==========================================

  async findOne(
    schoolId: string,
    eventId: string,
  ) {
    const event =
      await this.eventRepository.findOne({
        where: {
          id: eventId,
          schoolId,
        },
        relations: {
          academicYear: true,
          term: true,
          school: true,
        },
      });

    if (!event) {
      throw new NotFoundException(
        'Event not found in this school',
      );
    }

    return event;
  }

  // ==========================================
  // FIND BY ACADEMIC YEAR
  // ==========================================

  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ) {
    await this.verifyAcademicYear(
      academicYearId,
    );

    return this.eventRepository.find({
      where: {
        schoolId,
        academicYearId,
      },
      relations: {
        academicYear: true,
        term: true,
      },
      order: {
        startsAt: 'ASC',
      },
    });
  }

  // ==========================================
  // FIND BY ACADEMIC YEAR + TERM
  // ==========================================

  async findByAcademicYearAndTerm(
    schoolId: string,
    academicYearId: string,
    termId: string,
  ) {
    await this.verifyAcademicYear(
      academicYearId,
    );

    await this.verifyTerm(termId);

    return this.eventRepository.find({
      where: {
        schoolId,
        academicYearId,
        termId,
      },
      relations: {
        academicYear: true,
        term: true,
      },
      order: {
        startsAt: 'ASC',
      },
    });
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    schoolId: string,
    eventId: string,
    dto: UpdateEventDto,
  ) {
    const event = await this.findOne(
      schoolId,
      eventId,
    );

    // ------------------------------------------
    // Validate new dates if supplied
    // ------------------------------------------

    const newStartsAt = dto.startsAt
      ? new Date(dto.startsAt)
      : event.startsAt;

    const newEndsAt = dto.endsAt
      ? new Date(dto.endsAt)
      : event.endsAt;

    if (newEndsAt <= newStartsAt) {
      throw new BadRequestException(
        'Event end time must be after start time',
      );
    }

    // ------------------------------------------
    // Update
    // ------------------------------------------

    Object.assign(event, {
      ...dto,
      startsAt: newStartsAt,
      endsAt: newEndsAt,
    });

    return this.eventRepository.save(event);
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(
    schoolId: string,
    eventId: string,
  ) {
    const event = await this.findOne(
      schoolId,
      eventId,
    );

    await this.eventRepository.remove(event);

    return {
      message: 'Event deleted successfully',
    };
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private async verifyAcademicYear(
    academicYearId: string,
  ) {
    const academicYear =
      await this.academicYearRepository.findOne({
        where: {
          id: academicYearId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    return academicYear;
  }

  private async verifyTerm(
    termId: string,
  ) {
    const term =
      await this.termRepository.findOne({
        where: {
          id: termId,
        },
      });

    if (!term) {
      throw new NotFoundException(
        'Term not found',
      );
    }

    return term;
  }
}