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

  create(data: CreateCourseDto) {
    return this.courseRepo.save(data);
  }

  findAll() {
    return this.courseRepo.find({ relations: ['students', 'assignments'] }); // ✅ add assignments
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['students', 'assignments'], // ✅ add assignments
    });
    if (!course) throw new NotFoundException(`Course #${id} not found`);
    return course;
  }

  async update(id: number, data: UpdateCourseDto) {
    await this.findOne(id);
    await this.courseRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.courseRepo.delete(id);
  }
}