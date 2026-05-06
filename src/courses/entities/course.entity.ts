import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

import { Assignment } from "../../assignments/entities/assignment.entity";
import { Enrollment } from "../../enrollments/entities/enrollment.entity";

@Entity()
export class Course {
  @PrimaryGeneratedColumn("uuid")
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

  // One-to-Many: Course → Enrollments
  @OneToMany(() => Enrollment, (enrollment) => enrollment.course, {
    eager: true,
  })
  enrollments!: Enrollment[];

  //  Created timestamp
  @CreateDateColumn()
  createdAt!: Date;

  //  Updated timestamp
  @UpdateDateColumn()
  updatedAt!: Date;

  // Soft delete support
  @DeleteDateColumn()
  deletedAt!: Date;
}