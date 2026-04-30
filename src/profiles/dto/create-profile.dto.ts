import { IsString, IsNotEmpty, IsNumber, IsUrl, IsOptional } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  bio!: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  studentId!: number;
}