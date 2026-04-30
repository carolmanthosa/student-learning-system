import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: string; // ✅ description → dueDate

  @IsNumber()
  @IsNotEmpty()
  studentId!: number;

  @IsNumber()
  @IsNotEmpty()
  courseId!: number; // ✅ added
}