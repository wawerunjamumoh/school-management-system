import { Injectable } from '@nestjs/common';
import { CreateClassTeacherAssignmentDto } from './dto/create-class-teacher-assignment.dto.js';
import { UpdateClassTeacherAssignmentDto } from './dto/update-class-teacher-assignment.dto.js';

@Injectable()
export class ClassTeacherAssignmentService {
  create(createClassTeacherAssignmentDto: CreateClassTeacherAssignmentDto) {
    return 'This action adds a new classTeacherAssignment';
  }

  findAll() {
    return `This action returns all classTeacherAssignment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} classTeacherAssignment`;
  }

  update(id: number, updateClassTeacherAssignmentDto: UpdateClassTeacherAssignmentDto) {
    return `This action updates a #${id} classTeacherAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} classTeacherAssignment`;
  }
}
