import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {School} from  '../../school/entities/school.entity.js'

@Entity('exam')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  examName: string;
  @Column({charset: 'varchar',default: 'INTERNAL'})
  examId: string;

  @CreateDateColumn()
  startDate: Date;
  @CreateDateColumn()
  endDate: Date;

//   School relationship
  @ManyToOne(() => School,{onDelete: 'RESTRICT'})
  @JoinColumn({name: 'schoolId'})
  school: School;

  @Column()
  schoolId: string;
}
