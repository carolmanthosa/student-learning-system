import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  // One-to-One: Student ↔ Profile
  @OneToOne(() => Profile, (profile) => profile.student, {
    cascade: true,
    eager: true,
  })
  profile!: Profile;

  // Many-to-Many via Enrollment bridge table
  @OneToMany(() => Enrollment, (enrollment) => enrollment.student, {
    eager: true,
  })
  enrollments!: Enrollment[];
}