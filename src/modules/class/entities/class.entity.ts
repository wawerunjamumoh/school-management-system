import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type {Relation} from 'typeorm'
import {School} from '../../school/entities/school.entity.js';

@Entity('class')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  className: string;

  @Column()
  capacity: number;
  // School Rel
  @ManyToOne(
    () => School,
    (school) => school.classes,
    {onDelete: 'CASCADE'}
  )
  @JoinColumn({name: 'schoolId'})
  school: Relation<School>;

  @Column()
  schoolId: string;
}

