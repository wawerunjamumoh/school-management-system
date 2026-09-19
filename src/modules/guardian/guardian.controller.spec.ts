import { Test, TestingModule } from '@nestjs/testing';
import { GuardianController } from './guardian.controller.js';
import { GuardianService } from './guardian.service.js';

describe('GuardianController', () => {
  let controller: GuardianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuardianController],
      providers: [GuardianService],
    }).compile();

    controller = module.get<GuardianController>(GuardianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
