import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Homework 1' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @ApiProperty({ example: 'course-id-123' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;
}