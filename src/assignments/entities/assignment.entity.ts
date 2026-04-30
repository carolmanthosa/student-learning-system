import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  dueDate!: Date; // ✅ make sure this says dueDate, not description

  @ManyToOne(() => Student, (student) => student.assignments)
  student!: Student;

  @ManyToOne(() => Course, (course) => course.assignments)
  course!: Course;
}