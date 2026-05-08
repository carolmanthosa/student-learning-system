import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Advanced Mathematics' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'MATH201' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}