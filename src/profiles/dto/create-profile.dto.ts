import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  bio!: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsNotEmpty()
  studentId!: string;
}