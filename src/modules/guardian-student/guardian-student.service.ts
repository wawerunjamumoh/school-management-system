import { Injectable } from '@nestjs/common';
import { CreateGuardianStudentDto } from './dto/create-guardian-student.dto.js';
import { UpdateGuardianStudentDto } from './dto/update-guardian-student.dto.js';

@Injectable()
export class GuardianStudentService {
  create(createGuardianStudentDto: CreateGuardianStudentDto) {
    return 'This action adds a new guardianStudent';
  }

  findAll() {
    return `This action returns all guardianStudent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} guardianStudent`;
  }

  update(id: number, updateGuardianStudentDto: UpdateGuardianStudentDto) {
    return `This action updates a #${id} guardianStudent`;
  }

  remove(id: number) {
    return `This action removes a #${id} guardianStudent`;
  }
}
