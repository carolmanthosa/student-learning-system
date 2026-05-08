import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ example: 'Updated Homework Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: '2026-06-10' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'course-id-456' })
  @IsString()
  @IsOptional()
  courseId?: string;
}