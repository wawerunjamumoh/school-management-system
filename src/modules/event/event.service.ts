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

import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class EventService {
  private readonly CACHE_TTL = 60;

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,

    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,

    private readonly redisService: RedisService,
  ) {}

  // ==========================================
  // CACHE KEYS
  // ==========================================

  private getSchoolEventsKey(schoolId: string): string {
    return `school:${schoolId}:events:all`;
  }

  private getEventKey(
    schoolId: string,
    eventId: string,
  ): string {
    return `school:${schoolId}:event:${eventId}`;
  }

  private getAcademicYearEventsKey(
    schoolId: string,
    academicYearId: string,
  ): string {
    return `school:${schoolId}:academic-year:${academicYearId}:events`;
  }

  private getAcademicYearTermEventsKey(
    schoolId: string,
    academicYearId: string,
    termId: string,
  ): string {
    return `school:${schoolId}:academic-year:${academicYearId}:term:${termId}:events`;
  }

  // ==========================================
  // CACHE INVALIDATION
  // ==========================================

  private async invalidateEventCache(
    schoolId: string,
    eventId?: string,
    academicYearIds: (string | undefined)[] = [],
    termPairs: {
      academicYearId: string;
      termId: string;
    }[] = [],
  ): Promise<void> {
    const keys = new Set<string>([
      this.getSchoolEventsKey(schoolId),
    ]);

    if (eventId) {
      keys.add(this.getEventKey(schoolId, eventId));
    }

    for (const academicYearId of academicYearIds) {
      if (academicYearId) {
        keys.add(
          this.getAcademicYearEventsKey(
            schoolId,
            academicYearId,
          ),
        );
      }
    }

    for (const pair of termPairs) {
      keys.add(
        this.getAcademicYearTermEventsKey(
          schoolId,
          pair.academicYearId,
          pair.termId,
        ),
      );
    }

    await Promise.all(
      [...keys].map((key) => this.redisService.delete(key)),
    );
  }

  // ==========================================
  // CREATE
  // ==========================================

  async create(schoolId: string, dto: CreateEventDto) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      endsAt <= startsAt
    ) {
      throw new BadRequestException(
        'Event end time must be after start time',
      );
    }

    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const academicYear =
      await this.academicYearRepository.findOne({
        where: { id: dto.academicYearId },
      });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    const term = await this.termRepository.findOne({
      where: { id: dto.termId },
    });

    if (!term) {
      throw new NotFoundException('Term not found');
    }

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

    const savedEvent = await this.eventRepository.save(event);

    await this.invalidateEventCache(
      schoolId,
      savedEvent.id,
      [savedEvent.academicYearId],
      [
        {
          academicYearId: savedEvent.academicYearId,
          termId: savedEvent.termId,
        },
      ],
    );

    return savedEvent;
  }

  // ==========================================
  // FIND ALL SCHOOL EVENTS
  // ==========================================

  async findAll(schoolId: string) {
    const cacheKey = this.getSchoolEventsKey(schoolId);

    const cachedEvents =
      await this.redisService.getJson<Event[]>(cacheKey);

    if (cachedEvents !== null) {
      return cachedEvents;
    }

    const events = await this.eventRepository.find({
      where: { schoolId },
      relations: {
        academicYear: true,
        term: true,
      },
      order: {
        startsAt: 'ASC',
      },
    });

    await this.redisService.setJson(
      cacheKey,
      events,
      this.CACHE_TTL,
    );

    return events;
  }

  // ==========================================
  // FIND ONE — EVENT METADATA
  // ==========================================

  async findOne(schoolId: string, eventId: string) {
    const cacheKey = this.getEventKey(schoolId, eventId);

    const cachedEvent =
      await this.redisService.getJson<Event>(cacheKey);

    if (cachedEvent !== null) {
      return cachedEvent;
    }

    const event = await this.eventRepository.findOne({
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

    await this.redisService.setJson(
      cacheKey,
      event,
      this.CACHE_TTL,
    );

    return event;
  }

  // ==========================================
  // FIND BY ACADEMIC YEAR
  // ==========================================

  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ) {
    await this.verifyAcademicYear(academicYearId);

    const cacheKey = this.getAcademicYearEventsKey(
      schoolId,
      academicYearId,
    );

    const cachedEvents =
      await this.redisService.getJson<Event[]>(cacheKey);

    if (cachedEvents !== null) {
      return cachedEvents;
    }

    const events = await this.eventRepository.find({
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

    await this.redisService.setJson(
      cacheKey,
      events,
      this.CACHE_TTL,
    );

    return events;
  }

  // ==========================================
  // FIND BY ACADEMIC YEAR + TERM
  // ==========================================

  async findByAcademicYearAndTerm(
    schoolId: string,
    academicYearId: string,
    termId: string,
  ) {
    await this.verifyAcademicYear(academicYearId);
    await this.verifyTerm(termId);

    const cacheKey = this.getAcademicYearTermEventsKey(
      schoolId,
      academicYearId,
      termId,
    );

    const cachedEvents =
      await this.redisService.getJson<Event[]>(cacheKey);

    if (cachedEvents !== null) {
      return cachedEvents;
    }

    const events = await this.eventRepository.find({
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

    await this.redisService.setJson(
      cacheKey,
      events,
      this.CACHE_TTL,
    );

    return events;
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    schoolId: string,
    eventId: string,
    dto: UpdateEventDto,
  ) {
    const event = await this.findOne(schoolId, eventId);

    const oldAcademicYearId = event.academicYearId;
    const oldTermId = event.termId;

    const newStartsAt = dto.startsAt
      ? new Date(dto.startsAt)
      : new Date(event.startsAt);

    const newEndsAt = dto.endsAt
      ? new Date(dto.endsAt)
      : new Date(event.endsAt);

    if (
      Number.isNaN(newStartsAt.getTime()) ||
      Number.isNaN(newEndsAt.getTime()) ||
      newEndsAt <= newStartsAt
    ) {
      throw new BadRequestException(
        'Event end time must be after start time',
      );
    }

    Object.assign(event, {
      ...dto,
      startsAt: newStartsAt,
      endsAt: newEndsAt,
    });

    const updatedEvent =
      await this.eventRepository.save(event);

    await this.invalidateEventCache(
      schoolId,
      eventId,
      [
        oldAcademicYearId,
        updatedEvent.academicYearId,
      ],
      [
        ...(oldAcademicYearId && oldTermId
          ? [{
              academicYearId: oldAcademicYearId,
              termId: oldTermId,
            }]
          : []),
        ...(updatedEvent.academicYearId && updatedEvent.termId
          ? [{
              academicYearId: updatedEvent.academicYearId,
              termId: updatedEvent.termId,
            }]
          : []),
      ],
    );

    return updatedEvent;
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(schoolId: string, eventId: string) {
    const event = await this.findOne(schoolId, eventId);

    await this.eventRepository.remove(event);

    await this.invalidateEventCache(
      schoolId,
      eventId,
      [event.academicYearId],
      event.academicYearId && event.termId
        ? [{
            academicYearId: event.academicYearId,
            termId: event.termId,
          }]
        : [],
    );

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
        where: { id: academicYearId },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    return academicYear;
  }

  private async verifyTerm(termId: string) {
    const term = await this.termRepository.findOne({
      where: { id: termId },
    });

    if (!term) {
      throw new NotFoundException('Term not found');
    }

    return term;
  }
}