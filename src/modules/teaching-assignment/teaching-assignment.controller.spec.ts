import { Test, TestingModule } from '@nestjs/testing';
import { TeachingAssignmentController } from './teaching-assignment.controller.js';
import { TeachingAssignmentService } from './teaching-assignment.service.js';

describe('TeachingAssignmentController', () => {
  let controller: TeachingAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachingAssignmentController],
      providers: [TeachingAssignmentService],
    }).compile();

    controller = module.get<TeachingAssignmentController>(TeachingAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
