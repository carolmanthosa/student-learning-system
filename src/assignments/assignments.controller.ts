import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  create(@Body() body: any) {
    return this.assignmentsService.create(body);
  }

  @Get()
  findAll() {
    return this.assignmentsService.findAll();
  }

  // ✅ added
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(+id);
  }

  // ✅ added
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.assignmentsService.update(+id, body);
  }

  // ✅ added
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(+id);
  }
}