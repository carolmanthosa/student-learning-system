import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async create(data: CreateCourseDto): Promise<Course> {
    const course = this.courseRepo.create(data);
    return this.courseRepo.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.courseRepo.find({
      relations: ['assignments', 'enrollments', 'enrollments.student'],
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['assignments', 'enrollments', 'enrollments.student'],
    });
    if (!course) throw new NotFoundException(`Course #${id} not found`);
    return course;
  }

  async update(id: string, data: UpdateCourseDto): Promise<Course> {
    await this.findOne(id);
    await this.courseRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.courseRepo.delete(id);
    return { message: `Course #${id} deleted successfully` };
  }
}