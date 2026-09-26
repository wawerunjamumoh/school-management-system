import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import {Subject} from '../../subject/entities/subject.entity.js'
import { User } from '../../auth/entities/user.entity.js';

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

  @OneToOne(()  => User,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: User;
  @Column({type: 'char',length: 36,unique: true})
  userId: string;

  @Column()
  schoolId: string;

  @Column({ default: false })
  isVerified: boolean;

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[];
}
