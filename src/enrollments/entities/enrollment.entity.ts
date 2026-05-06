import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from "typeorm";

import { Student } from "../../students/entities/student.entity";
import { Course } from "../../courses/entities/course.entity";

@Entity("enrollments")
@Unique(["student", "course"]) 
export class Enrollment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Many-to-One: Enrollment → Student
  @ManyToOne(() => Student, (student) => student.enrollments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  student!: Student;

  // Many-to-One: Enrollment → Course
  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "course_id" })
  course!: Course;

  //  Timestamp when enrolled
  @CreateDateColumn()
  enrolledAt!: Date;

  //  Track updates (if enrollment is modified later)
  @UpdateDateColumn()
  updatedAt!: Date;

  // Soft delete support
  @DeleteDateColumn()
  deletedAt!: Date;
}