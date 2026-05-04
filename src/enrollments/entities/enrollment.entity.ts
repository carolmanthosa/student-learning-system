import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Many-to-One: Enrollment → Student
  @ManyToOne(() => Student, (student) => student.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  // Many-to-One: Enrollment → Course
  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @CreateDateColumn()
  enrolledAt!: Date;
}