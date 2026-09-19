import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import {School} from '../../school/entities/school.entity.js'

@Entity('notice-board')
export class NoticeBoard {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  title: string;

  @CreateDateColumn()
  publishedAt: Date;
  @CreateDateColumn()
  expiresAt: Date;

  @Column()
  createdBy: string;

//   Rel: school has many notices
  @ManyToOne(() => School,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'schoolId'})
  school: School;

  @Column()
  schoolId: string;


}
