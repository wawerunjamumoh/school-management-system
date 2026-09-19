import { Test, TestingModule } from '@nestjs/testing';
import { HeadTeacherAssignmentController } from './head-teacher-assignment.controller.js';
import { HeadTeacherAssignmentService } from './head-teacher-assignment.service.js';

describe('HeadTeacherAssignmentController', () => {
  let controller: HeadTeacherAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeadTeacherAssignmentController],
      providers: [HeadTeacherAssignmentService],
    }).compile();

    controller = module.get<HeadTeacherAssignmentController>(HeadTeacherAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
