import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() body: CreateStudentDto) {
    return this.studentsService.create(body);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateStudentDto) {
    return this.studentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Get(':id/courses')
  getCourses(@Param('id') id: string) {
    return this.studentsService.getCourses(id);
  }

  @Post(':id/enroll/:courseId')
  enroll(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.studentsService.enroll(id, courseId);
  }

  @Delete(':id/unenroll/:courseId')
  unenroll(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.studentsService.unenroll(id, courseId);
  }
}