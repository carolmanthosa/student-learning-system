import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  bio!: string;

  @Column()
  avatarUrl!: string;

  @OneToOne(() => Student, (student) => student.profile)
  @JoinColumn()
  student!: Student;
}