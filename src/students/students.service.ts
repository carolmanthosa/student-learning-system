import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  create(data: CreateStudentDto) {
    const student = this.studentRepo.create(data);
    return this.studentRepo.save(student);
  }

  findAll() {
    return this.studentRepo.find({ relations: ['profile'] }); // ✅ include profile
  }

  async findOne(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['profile'], // ✅ include profile
    });
    if (!student) throw new NotFoundException(`Student #${id} not found`);
    return student;
  }

  async update(id: number, data: UpdateStudentDto) {
    await this.findOne(id);
    await this.studentRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.studentRepo.delete(id);
  }

  async getCourses(studentId: number) {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['courses'],
    });
    if (!student) throw new NotFoundException(`Student #${studentId} not found`);
    return student.courses;
  }

  async enroll(studentId: number, courseId: number) {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['courses'],
    });
    if (!student) throw new NotFoundException(`Student #${studentId} not found`);

    const course = await this.courseRepo.findOneBy({ id: courseId });
    if (!course) throw new NotFoundException(`Course #${courseId} not found`);

    student.courses = [...(student.courses ?? []), course];
    return this.studentRepo.save(student);
  }

  // ✅ added
  async getAssignments(studentId: number) {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['assignments', 'assignments.course'],
    });
    if (!student) throw new NotFoundException(`Student #${studentId} not found`);
    return student.assignments;
  }
}