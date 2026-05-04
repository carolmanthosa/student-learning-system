import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async create(data: CreateAssignmentDto): Promise<Assignment> {
    const course = await this.courseRepo.findOneBy({ id: data.courseId });
    if (!course) throw new NotFoundException(`Course #${data.courseId} not found`);

    const assignment = this.assignmentRepo.create({
      title: data.title,
      dueDate: new Date(data.dueDate),
      course,
    });

    return this.assignmentRepo.save(assignment);
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentRepo.find({ relations: ['course'] });
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['course'],
    });
    if (!assignment) throw new NotFoundException(`Assignment #${id} not found`);
    return assignment;
  }

  async update(id: string, data: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.findOne(id);

    if (data.title) assignment.title = data.title;
    if (data.dueDate) assignment.dueDate = new Date(data.dueDate);

    if (data.courseId) {
      const course = await this.courseRepo.findOneBy({ id: data.courseId });
      if (!course) throw new NotFoundException(`Course #${data.courseId} not found`);
      assignment.course = course;
    }

    return this.assignmentRepo.save(assignment);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.assignmentRepo.delete(id);
    return { message: `Assignment #${id} deleted successfully` };
  }
}