import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Student } from '../students/entities/student.entity';
import { Course } from '../courses/entities/course.entity'; // ✅ added
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(Course) // ✅ added
    private courseRepo: Repository<Course>,
  ) {}

  async create(data: CreateAssignmentDto) {
    const student = await this.studentRepo.findOneBy({ id: data.studentId });
    if (!student) throw new NotFoundException(`Student #${data.studentId} not found`);

    const course = await this.courseRepo.findOneBy({ id: data.courseId }); // ✅ added
    if (!course) throw new NotFoundException(`Course #${data.courseId} not found`); // ✅ added

    const assignment = this.assignmentRepo.create({
      title: data.title,
      dueDate: new Date(data.dueDate), // ✅ description → dueDate
      student,
      course, // ✅ added
    });

    return this.assignmentRepo.save(assignment);
  }

  findAll() {
    return this.assignmentRepo.find({ relations: ['student', 'course'] }); // ✅ add course
  }

  async findOne(id: number) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['student', 'course'], // ✅ add course
    });
    if (!assignment) throw new NotFoundException(`Assignment #${id} not found`);
    return assignment;
  }

  async update(id: number, data: UpdateAssignmentDto) {
    await this.findOne(id);
    await this.assignmentRepo.update(id, {
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined, // ✅ description → dueDate
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.assignmentRepo.delete(id);
  }
}