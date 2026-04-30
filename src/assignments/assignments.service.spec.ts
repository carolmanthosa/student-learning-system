import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  async create(data: any) {
    const student = await this.studentRepo.findOne({
      where: { id: data.studentId },
    });

    if (!student) {
      return { message: 'Student not found' };
    }

    const assignment = this.assignmentRepo.create({
      title: data.title,
      description: data.description,
      student,
    });

    return this.assignmentRepo.save(assignment);
  }

  findAll() {
    return this.assignmentRepo.find({
      relations: ['student'],
    });
  }
}