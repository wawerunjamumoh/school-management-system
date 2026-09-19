import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {Guardian} from '../../guardian/entities/guardian.entity.js'
import {Student} from '../../student/entities/student.entity.js';

@Entity('guardian-student')
export class GuardianStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

//   Student guardian relationship
  @ManyToMany(() => Guardian,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'guardian-student'})
  guardians: Guardian[];

  @Column()
  guardianId: string;

//   Link to student
  @ManyToOne(() => Student,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'studentId'})
  student: Student;

  @Column()
  studentId: string;


}
