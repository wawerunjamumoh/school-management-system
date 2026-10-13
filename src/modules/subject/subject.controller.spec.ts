
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SubjectService } from './subject.service.js';
import { Subject } from './entities/subject.entity.js';
import { School } from '../school/entities/school.entity.js';
import { RedisService } from '../../redis/redis.service.js';

describe('SubjectService', () => {
  let service: SubjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: getRepositoryToken(Subject),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            find: vi.fn(),
            findOne: vi.fn(),
            remove: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(School),
          useValue: {
            findOne: vi.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            getJson: vi.fn().mockResolvedValue(null),
            setJson: vi.fn().mockResolvedValue(true),
            delete: vi.fn().mockResolvedValue(true),
            ping: vi.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
