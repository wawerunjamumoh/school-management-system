import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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
  @Column({ type: 'date' })
  startDate: Date;
  @Column({ type: 'date' })
  endDate: Date;

//   School Relationship
  @ManyToOne(() => School,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'schoolId'})
  school: School;

  @Column()
  schoolId: string;
}
