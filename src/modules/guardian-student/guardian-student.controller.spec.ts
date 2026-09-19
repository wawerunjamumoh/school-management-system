import { Test, TestingModule } from '@nestjs/testing';
import { GuardianStudentController } from './guardian-student.controller.js';
import { GuardianStudentService } from './guardian-student.service.js';

describe('GuardianStudentController', () => {
  let controller: GuardianStudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuardianStudentController],
      providers: [GuardianStudentService],
    }).compile();

    controller = module.get<GuardianStudentController>(GuardianStudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
