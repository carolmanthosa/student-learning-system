import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  dueDate!: Date;

  // Many-to-One: Assignment belongs to one Course
  @ManyToOne(() => Course, (course) => course.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  course!: Course;
}