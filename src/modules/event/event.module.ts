import { Module } from '@nestjs/common';
import { EventService } from './event.service.js';
import { EventController } from './event.controller.js';

@Module({
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
