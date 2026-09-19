import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
  Unique,
  JoinColumn,
  ManyToOne, ManyToMany
} from 'typeorm';
import {Student} from '../../student/entities/student.entity.js'
import {Class} from '../../class/entities/class.entity.js'
import {AcademicYear} from '../../academic-year/entities/academic-year.entity.js';
import {Term} from '../../term/entities/term.entity.js';

@Entity('enrollment')
// prevent student being enrolled in multiple classes the same term
@Unique(['studentId','academicYear','termId'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: string;
  @CreateDateColumn({type: 'timestamp',default:() => 'CURRENT_TIMESTAMP'})
  enrollDate: Date;
  @Column({type: 'varchar',default: 'ACIVE'})
  status: string;

// Rel: one enrollment-many students,one student
  @ManyToOne(() => Student,{onDelete: 'RESTRICT'})
  @JoinColumn({name: 'studentId'})
  student: Student;

  @Column()
  studentId: string;

//   Rel: Class has many enrollments,enrollment has one class
  @ManyToMany(() => Class,{onDelete: 'RESTRICT'})
  @JoinColumn({name: 'classId'})
  class: Class;

  @Column()
  classId: string;

// Rel: one academic year has may terms
  @ManyToOne(() => AcademicYear,{onDelete: 'RESTRICT'})
  @JoinColumn({name: 'academicYear'})
  academicYear: AcademicYear;

  @Column()
  academicYearId: string;

//   Rel: One term - many enrollments,
  @ManyToOne(() => Term,{onDelete: 'RESTRICT'})
  @JoinColumn({name: 'termId'})
  term: Term;

  @Column()
  termId: string;

}
