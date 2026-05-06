import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StudentsService } from '../students/students.service';

@Injectable()
export class AuthService {
  constructor(
    private studentsService: StudentsService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const student = await this.studentsService.findOne(email);

    if (!student) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: student.id,
      email: student.email,
      role: student.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}