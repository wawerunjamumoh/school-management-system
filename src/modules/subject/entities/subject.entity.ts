import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import {Term} from '../../term/entities/term.entity.js'
import {Class} from '../../class/entities/class.entity.js';

@Entity('subject')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  subject_id: string;
  @Column()
  name: string;
  @Column()
  description: string;

//   Rel:One term has many units/subjects
  @ManyToOne(() => Term,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'termId'})
  term = Term;

  @Column()
  tremId: string;

//   Rel: Many class has many subjects
  @ManyToMany(() => Class,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'classId'})
  class = Class;

  @Column()
  schoolId: string;
}
