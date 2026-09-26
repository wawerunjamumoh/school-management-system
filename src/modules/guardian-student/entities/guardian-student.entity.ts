import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { Guardian } from '../../guardian/entities/guardian.entity.js';
import { Student } from '../../student/entities/student.entity.js';

@Entity('guardian-student')
@Unique(['guardianId', 'studentId'])
export class GuardianStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Guardian
  @ManyToOne(() => Guardian, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guardianId' })
  guardian: Guardian;

  @Column()
  guardianId: string;

  // Student
  @ManyToOne(() => Student, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;
}
