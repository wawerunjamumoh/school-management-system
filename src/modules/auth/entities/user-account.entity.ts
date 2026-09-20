import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PlatformRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Entity('user_accounts')
export class UserAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email?: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ type: 'simple-array', default: '' })
  platformRoles: PlatformRole[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  tokenVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
