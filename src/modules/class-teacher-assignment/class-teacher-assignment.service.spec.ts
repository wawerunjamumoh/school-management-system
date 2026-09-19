import { Test, TestingModule } from '@nestjs/testing';
import { ClassTeacherAssignmentService } from './class-teacher-assignment.service.js';

describe('ClassTeacherAssignmentService', () => {
  let service: ClassTeacherAssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassTeacherAssignmentService],
    }).compile();

    service = module.get<ClassTeacherAssignmentService>(ClassTeacherAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
