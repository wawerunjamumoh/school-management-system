import { Test, TestingModule } from '@nestjs/testing';
import { GuardianStudentService } from './guardian-student.service.js';

describe('GuardianStudentService', () => {
  let service: GuardianStudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuardianStudentService],
    }).compile();

    service = module.get<GuardianStudentService>(GuardianStudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
