import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  bio!: string;

  @Column({ nullable: true })
  avatarUrl!: string;

  // One-to-One: Profile belongs to one Student
  @OneToOne(() => Student, (student) => student.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  student!: Student;
}