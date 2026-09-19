import { Test, TestingModule } from '@nestjs/testing';
import { ClassTeacherAssignmentController } from './class-teacher-assignment.controller.js';
import { ClassTeacherAssignmentService } from './class-teacher-assignment.service.js';

describe('ClassTeacherAssignmentController', () => {
  let controller: ClassTeacherAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassTeacherAssignmentController],
      providers: [ClassTeacherAssignmentService],
    }).compile();

    controller = module.get<ClassTeacherAssignmentController>(ClassTeacherAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
