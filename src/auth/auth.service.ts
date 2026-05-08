import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Student } from '../students/entities/student.entity';
import { Role } from './roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    private jwtService: JwtService,
  ) {}

  // Register
  async register(
    name: string,
    email: string,
    password: string,
    role: Role,
  ) {
    const existing = await this.studentRepo.findOne({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(password, 10);

    const student = this.studentRepo.create({
      name,
      email,
      password: hashed,
      role,
    });

    await this.studentRepo.save(student);

    return {
      message: 'Account created successfully',
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
    };
  }

  // Login
  async login(email: string, password: string) {
    const user = await this.studentRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}