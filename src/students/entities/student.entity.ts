import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

import { Profile } from "../../profiles/entities/profile.entity";
import { Enrollment } from "../../enrollments/entities/enrollment.entity";
import { Role } from "../../auth/roles.enum";

@Entity()
export class Student {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // RBAC role
  @Column({
    type: "enum",
    enum: Role,
    default: Role.STUDENT,
  })
  role!: Role;

  // One-to-One: Student ↔ Profile
  @OneToOne(() => Profile, (profile) => profile.student, {
    cascade: true,
    eager: true,
  })
  profile!: Profile;

  // One-to-Many: Student ↔ Enrollment
  @OneToMany(() => Enrollment, (enrollment) => enrollment.student, {
    eager: true,
  })
  enrollments!: Enrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}