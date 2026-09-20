import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum SchoolRole {
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN',
}

@Entity('school_memberships')
@Unique(['schoolId', 'loginIdentifier'])
@Index(['userId', 'schoolId'])
export class SchoolMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  schoolId: string;

  @Column({ type: 'varchar' })
  role: SchoolRole;

  @Column()
  loginIdentifier: string;

  @Column({ default: true })
  isActive: boolean;
}
