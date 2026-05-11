import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  // ✅ Static routes MUST come before dynamic ones
  @Get('student/:studentId')
  getStudentEnrollments(@Param('studentId') studentId: string) {
    return this.enrollmentsService.getStudentEnrollments(studentId);
  }

  @Post(':studentId/:courseId')
  enroll(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.enroll(studentId, courseId);
  }

  @Delete(':studentId/:courseId')
  unenroll(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.unenroll(studentId, courseId);
  }
}