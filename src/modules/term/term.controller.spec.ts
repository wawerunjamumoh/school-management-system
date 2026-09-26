import { Test, TestingModule } from '@nestjs/testing';
import { TermController } from './term.controller.js';
import { TermService } from './term.service.js';

describe('TermController', () => {
  let controller: TermController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermController],
      providers: [TermService],
    }).compile();

    controller = module.get<TermController>(TermController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    it('should call findAll', () => {
        expect(controller.findAll).toBeDefined();
    });
});
