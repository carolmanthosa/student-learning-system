import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateAssignmentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string; // ✅ description → dueDate
}