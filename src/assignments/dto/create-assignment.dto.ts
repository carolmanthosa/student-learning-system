import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @IsString()
  @IsNotEmpty()
  courseId!: string;
}