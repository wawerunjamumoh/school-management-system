import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import {Student} from '../../student/entities/student.entity.js';
import {Subject} from '../../subject/entities/subject.entity.js';
import {Exam} from '../../exam/entities/exam.entity.js';
import {Term} from '../../term/entities/term.entity.js'

@Entity('exam-result')
export class ExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  score: string;

  //   Student Relationship
  @ManyToOne(() => Student, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  //   Subject Relationship
  @ManyToOne(() => Subject, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'termId' })
  subject: Subject;

  @Column()
  subjectId: string;

  //   Exam Relationship
  @ManyToOne(() => Exam, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @Column()
  examId: string;

  //   Term Relationship
  @ManyToOne(() => Term, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subjectId' })
  term : Term;

  @Column()
  termId: string;
}
