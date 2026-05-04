import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  code!: string;

  // One-to-Many: Course → Assignments
  @OneToMany(() => Assignment, (assignment) => assignment.course, {
    cascade: true,
    eager: true,
  })
  assignments!: Assignment[];

  // Many-to-Many via Enrollment bridge table
  @OneToMany(() => Enrollment, (enrollment) => enrollment.course, {
    eager: true,
  })
  enrollments!: Enrollment[];
}