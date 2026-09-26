import { Test, TestingModule } from '@nestjs/testing';
import { SchoolMembershipService } from './school-membership.service.js';

describe('SchoolMembershipService', () => {
  let service: SchoolMembershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolMembershipService],
    }).compile();

    service = module.get<SchoolMembershipService>(SchoolMembershipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
