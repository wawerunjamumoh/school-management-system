import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true})
  email: string;

  @Column({select: false})
  passwordHash: string;


  @Column({type: 'enum',enum: UserRole})
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
