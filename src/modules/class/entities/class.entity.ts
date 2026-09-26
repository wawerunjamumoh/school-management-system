import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {School} from '../../school/entities/school.entity.js';

@Entity('class')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  // School Rel

  @ManyToOne(
    () => School,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: string;

  @Column()
  className: string;

  @Column()
  capacity: number;

  @Column()
  level: string;

  @Column()
  stream: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

