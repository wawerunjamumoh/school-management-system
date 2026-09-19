import { Injectable } from '@nestjs/common';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto.js';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto.js';

@Injectable()
export class TeachingAssignmentService {
  create(createTeachingAssignmentDto: CreateTeachingAssignmentDto) {
    return 'This action adds a new teachingAssignment';
  }

  findAll() {
    return `This action returns all teachingAssignment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teachingAssignment`;
  }

  update(id: number, updateTeachingAssignmentDto: UpdateTeachingAssignmentDto) {
    return `This action updates a #${id} teachingAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} teachingAssignment`;
  }
}
