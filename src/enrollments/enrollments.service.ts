import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Enrollment } from "./entities/enrollment.entity";
import { Student } from "../students/entities/student.entity";
import { Course } from "../courses/entities/course.entity";

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  // Get all enrollments
  findAll() {
    return this.enrollmentRepo.find({
      relations: ["student", "course"],
    });
  }

  // Enroll student into course
  async enroll(studentId: string, courseId: string) {
    const student = await this.studentRepo.findOneBy({ id: studentId });
    if (!student) {
      throw new NotFoundException(`Student #${studentId} not found`);
    }

    const course = await this.courseRepo.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course #${courseId} not found`);
    }

    // DB-level safety already exists (@Unique), but we still check for better UX
    const existing = await this.enrollmentRepo.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
    });

    if (existing) {
      throw new ConflictException("Student already enrolled in this course");
    }

    const enrollment = this.enrollmentRepo.create({
      student,
      course,
    });

    return this.enrollmentRepo.save(enrollment);
  }

  // Unenroll student from course
  async unenroll(studentId: string, courseId: string) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    return this.enrollmentRepo.remove(enrollment);
  }

  // Get all courses for a student
  async getStudentEnrollments(studentId: string) {
    const student = await this.studentRepo.findOneBy({ id: studentId });

    if (!student) {
      throw new NotFoundException(`Student #${studentId} not found`);
    }

    return this.enrollmentRepo.find({
      where: { student: { id: studentId } },
      relations: ["course", "course.assignments"],
    });
  }
}