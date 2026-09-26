import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';

@Entity('guardian')
export class Guardian {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  email: string;
  @Column()
  phone: string;

  @OneToOne(()  => User,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: User;
  @Column({type: 'char',length: 36,unique: true})
  userId: string;

}
