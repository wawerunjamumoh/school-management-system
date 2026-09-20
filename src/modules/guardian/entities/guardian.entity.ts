import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('guardian')
export class Guardian {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column({ unique: true })
  guardianId: string;
  @Column('uuid', { nullable: true, unique: true })
  userId?: string;
  @Column()
  email: string;
  @Column()
  phone: string;
  @Column()
  relatioship: string;


}
