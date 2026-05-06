import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

async function login(this: any, email: string, password: string) {
  const user = await this.studentRepo.findOne({ where: { email } });

  if (!user) throw new NotFoundException('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedException('Invalid credentials');

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: this.jwtService.sign(payload),
  };
}