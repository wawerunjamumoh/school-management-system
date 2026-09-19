import { Module } from '@nestjs/common';
import { GuardianService } from './guardian.service.js';
import { GuardianController } from './guardian.controller.js';

@Module({
  controllers: [GuardianController],
  providers: [GuardianService],
})
export class GuardianModule {}
