import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { Assignment } from './entities/assignment.entity';
import { Student } from '../students/entities/student.entity';
import { Course } from '../courses/entities/course.entity'; // ✅ added

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Student, Course])], // ✅ add Course
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}