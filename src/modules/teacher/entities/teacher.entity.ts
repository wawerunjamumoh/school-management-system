import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import {Subject} from '../../subject/entities/subject.entity.js'

@Entity('teacher')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  phone: string;
  @Column()
  email: string;
  @Column()
  teacher_id: string;
  @Column()
  school_id: string;
  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[];
}
