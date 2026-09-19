import { Test, TestingModule } from '@nestjs/testing';
import { ExamResultController } from './exam-result.controller.js';
import { ExamResultService } from './exam-result.service.js';

describe('ExamResultController', () => {
  let controller: ExamResultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamResultController],
      providers: [ExamResultService],
    }).compile();

    controller = module.get<ExamResultController>(ExamResultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
