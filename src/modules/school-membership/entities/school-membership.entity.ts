import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User,UserRole } from '../../auth/entities/user.entity.js';
import { School } from '../../school/entities/school.entity.js';

export enum MembershipStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

@Unique(['userId', 'schoolId'])
@Entity('school-membership')
export class SchoolMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //   Rel: user - userId
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column()
  userId: string;

  //   Rel: school - schoolId
  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School;
  @Column()
  schoolId: string;

  //   role
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  //   Status
  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.PENDING,
  })
  status: MembershipStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
