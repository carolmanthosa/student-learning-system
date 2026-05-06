import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';


@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}
  
  async findByEmail(email: string) {
    return this.studentRepo.findOne({
      where: { email },
    });
  }
 
  create(data: CreateStudentDto) {
    const student = this.studentRepo.create(data);
    return this.studentRepo.save(student);
  }

  findAll() {
    return this.studentRepo.find({
      relations: ['profile', 'enrollments', 'enrollments.course', 'enrollments.course.assignments'],
    });
  }

  async findOne(id: string) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['profile', 'enrollments', 'enrollments.course', 'enrollments.course.assignments'],
    });
    if (!student) throw new NotFoundException(`Student #${id} not found`);
    return student;
  }

  async update(id: string, data: UpdateStudentDto) {
    await this.findOne(id);
    await this.studentRepo.update(id, data);
    return this.findOne(id);
  }

 async remove(id: string) {
  const student = await this.studentRepo.findOne({
    where: { id },
    relations: ['enrollments'],
  });
  if (!student) throw new NotFoundException(`Student #${id} not found`);
  
  // Soft delete enrollments first
  await this.enrollmentRepo.softDelete({ student: { id } });
  
  // Soft delete student (sets deletedAt instead of removing)
  return this.studentRepo.softDelete(id);
}

  async getCourses(studentId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { student: { id: studentId } },
      relations: ['course'],
    });
    return enrollments.map(e => e.course);
  }

  async enroll(studentId: string, courseId: string) {
    const student = await this.studentRepo.findOneBy({ id: studentId });
    if (!student) throw new NotFoundException(`Student #${studentId} not found`);

    const course = await this.courseRepo.findOneBy({ id: courseId });
    if (!course) throw new NotFoundException(`Course #${courseId} not found`);

    const existing = await this.enrollmentRepo.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (existing) return this.findOne(studentId);

    const enrollment = this.enrollmentRepo.create({ student, course });
    await this.enrollmentRepo.save(enrollment);
    return this.findOne(studentId);
  }

  async unenroll(studentId: string, courseId: string) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    await this.enrollmentRepo.remove(enrollment);
    return this.findOne(studentId);
  }
}
