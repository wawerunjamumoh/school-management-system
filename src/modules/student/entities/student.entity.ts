import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity.js';
import  { Class } from  '../../class/entities/class.entity.js';

@Entity('student')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  studentId: string;
//   School Relationship - One school has many classes,class belongs to one school
  @ManyToOne(() => School,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'schoolId'})
  school: School

  @Column()
  schoolId: string;

//   Class Relationship - One class can have many students,student belongs to one class
  @ManyToOne(() => Class,{onDelete: 'SET NULL'})
  @JoinColumn({name: 'classId'})
  class: Class ;

  @Column()
  classId: string;
}
