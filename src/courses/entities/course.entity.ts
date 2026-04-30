import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  code!: string;

  @ManyToMany(() => Student, (student) => student.courses)
  students!: Student[];

  @OneToMany(() => Assignment, (assignment) => assignment.course)
  assignments!: Assignment[];
}