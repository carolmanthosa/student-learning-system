import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  create(@Body() body: CreateAssignmentDto) {
    return this.assignmentsService.create(body);
  }

  @Get()
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateAssignmentDto) {
    return this.assignmentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}