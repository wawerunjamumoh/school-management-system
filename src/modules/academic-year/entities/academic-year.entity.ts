import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import {School} from '../../school/entities/school.entity.js';

@Entity('academicYear')
export class AcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @CreateDateColumn()
  startDate: Date;
  @CreateDateColumn()
  endDate: Date;

//   School Relationship
  @ManyToOne(() => School,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'schoolId'})
  school: School;

  @Column()
  schoolId: string;
}
