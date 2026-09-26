import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity.js';
import { User } from '../../auth/entities/user.entity.js';

@Entity('student')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  gender: string;

  @Column({type: 'date'})
  dateOfBirth: Date;

  @OneToOne(() => User,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: User;
  @Column({type: 'char',length: 36,unique: true})
  userId: string;

//   School Relationship - One school has many classes,class belongs to one school
  @ManyToOne(() => School,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'schoolId'})
  school: School;

  @Column({type: 'char',length: 36})
  schoolId: string;

}
