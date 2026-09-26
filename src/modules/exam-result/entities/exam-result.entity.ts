import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { Student } from '../../student/entities/student.entity.js';
import { Subject } from '../../subject/entities/subject.entity.js';
import { Exam } from '../../exam/entities/exam.entity.js';
import { Term } from '../../term/entities/term.entity.js';

@Entity('exam-result')
@Unique(['studentId', 'subjectId', 'examId'])
export class ExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  score: number;

  // Student
  @ManyToOne(() => Student, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  // Subject
  @ManyToOne(() => Subject, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column()
  subjectId: string;

  // Exam
  @ManyToOne(() => Exam, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @Column()
  examId: string;

  // Term
  @ManyToOne(() => Term, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'termId' })
  term: Term;

  @Column()
  termId: string;
}
