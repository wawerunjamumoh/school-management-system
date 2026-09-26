import { Test, TestingModule } from '@nestjs/testing';
import { SchoolMembershipController } from './school-membership.controller.js';
import { SchoolMembershipService } from './school-membership.service.js';

describe('SchoolMembershipController', () => {
  let controller: SchoolMembershipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolMembershipController],
      providers: [SchoolMembershipService],
    }).compile();

    controller = module.get<SchoolMembershipController>(SchoolMembershipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
