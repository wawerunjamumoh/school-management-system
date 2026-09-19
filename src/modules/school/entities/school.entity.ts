import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Class } from '../../class/entities/class.entity.js';
import { Event } from '../../event/entities/event.entity.js'; // Ensure this is imported if bidirectional

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_name' })
  schoolName: string;

  @Column()
  location: string;

  @Column({ name: 'school_phone' })
  schoolPhone: string;

  @Column({ name: 'school_email', unique: true }) // School emails are usually unique
  schoolEmail: string;

  // Class relationship
  @OneToMany(() => Class, (cls) => cls.school) // Fixed the 'class' reserved keyword bug
  classes: Class[];

  // Optional: Allows school.events lookup if needed
  @OneToMany(() => Event, (event) => event.school)
  events: Event[];
}
