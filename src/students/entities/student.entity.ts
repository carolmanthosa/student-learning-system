import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { Course } from '../../courses/entities/course.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  // One-to-One: Student ↔ Profile
  @OneToOne(() => Profile, (profile) => profile.student)
  profile!: Profile;

  // Many-to-Many: Student ↔ Courses (ENROLLMENT)
  @ManyToMany(() => Course, (course) => course.students)
  @JoinTable()
  courses!: Course[];

  // One-to-Many: Student → Assignments
  @OneToMany(() => Assignment, (assignment) => assignment.student)
  assignments!: Assignment[];
}