import { Injectable } from '@nestjs/common';
import { CreateHeadTeacherAssignmentDto } from './dto/create-head-teacher-assignment.dto.js';
import { UpdateHeadTeacherAssignmentDto } from './dto/update-head-teacher-assignment.dto.js';

@Injectable()
export class HeadTeacherAssignmentService {
  create(createHeadTeacherAssignmentDto: CreateHeadTeacherAssignmentDto) {
    return 'This action adds a new headTeacherAssignment';
  }

  findAll() {
    return `This action returns all headTeacherAssignment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} headTeacherAssignment`;
  }

  update(id: number, updateHeadTeacherAssignmentDto: UpdateHeadTeacherAssignmentDto) {
    return `This action updates a #${id} headTeacherAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} headTeacherAssignment`;
  }
}
