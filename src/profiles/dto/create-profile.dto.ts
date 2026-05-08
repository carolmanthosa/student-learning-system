import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 'I am a computer science student.' })
  @IsString()
  @IsNotEmpty()
  bio!: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ example: 'student-id-123' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;
}