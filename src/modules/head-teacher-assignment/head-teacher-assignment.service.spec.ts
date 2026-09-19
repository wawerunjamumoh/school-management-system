import { Test, TestingModule } from '@nestjs/testing';
import { HeadTeacherAssignmentService } from './head-teacher-assignment.service.js';

describe('HeadTeacherAssignmentService', () => {
  let service: HeadTeacherAssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeadTeacherAssignmentService],
    }).compile();

    service = module.get<HeadTeacherAssignmentService>(HeadTeacherAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
