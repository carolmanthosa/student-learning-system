import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Student } from '../students/entities/student.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  findAll() {
    return this.enrollmentRepo.find({
      relations: ['student', 'course'],
    });
  }

  async enroll(studentId: string, courseId: string) {
    const student = await this.studentRepo.findOneBy({ id: studentId });
    if (!student) throw new NotFoundException(`Student #${studentId} not found`);

    const course = await this.courseRepo.findOneBy({ id: courseId });
    if (!course) throw new NotFoundException(`Course #${courseId} not found`);

    // Check if already enrolled
    const existing = await this.enrollmentRepo.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (existing) throw new ConflictException('Student already enrolled in this course');

    const enrollment = this.enrollmentRepo.create({ student, course });
    return this.enrollmentRepo.save(enrollment);
  }

  async unenroll(studentId: string, courseId: string) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return this.enrollmentRepo.remove(enrollment);
  }

  async getStudentEnrollments(studentId: string) {
    return this.enrollmentRepo.find({
      where: { student: { id: studentId } },
      relations: ['course', 'course.assignments'],
    });
  }
}