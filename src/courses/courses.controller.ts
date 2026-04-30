import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto'; // ✅ added
import { UpdateCourseDto } from './dto/update-course.dto'; // ✅ added

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() body: CreateCourseDto) { // ✅ body: any → CreateCourseDto
    return this.coursesService.create(body);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateCourseDto) { // ✅ body: any → UpdateCourseDto
    return this.coursesService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}