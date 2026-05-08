import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { Student } from '../students/entities/student.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  // ---------------- CREATE ----------------
  async create(data: CreateProfileDto, user: any): Promise<Profile> {
    const isAdmin = user.role === 'admin';

    // 👇 student can ONLY create their own profile
    if (!isAdmin) {
      data.studentId = user.id;
    }

    const student = await this.studentRepo.findOneBy({ id: data.studentId });
    if (!student) throw new NotFoundException('Student not found');

    // ❌ prevent duplicate profile
    const existing = await this.profileRepo.findOne({
      where: { student: { id: data.studentId } },
    });

    if (existing) {
      throw new ConflictException('Profile already exists');
    }

    const profile = this.profileRepo.create({
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      student,
    });

    return this.profileRepo.save(profile);
  }

  // ---------------- FIND ALL ----------------
  async findAll(user: any): Promise<Profile[]> {
    const isAdmin = user.role === 'admin';

    if (isAdmin) {
      return this.profileRepo.find({ relations: ['student'] });
    }

    // student sees ONLY own profile
    return this.profileRepo.find({
      where: { student: { id: user.id } },
      relations: ['student'],
    });
  }

  // ---------------- FIND ONE ----------------
  async findOne(id: string, user: any): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const isAdmin = user.role === 'admin';
    const isOwner = profile.student.id === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Not allowed');
    }

    return profile;
  }

  // ---------------- UPDATE ----------------
  async update(id: string, data: UpdateProfileDto, user: any): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const isAdmin = user.role === 'admin';
    const isOwner = profile.student.id === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Not allowed');
    }

    await this.profileRepo.update(id, data);

    return this.findOne(id, user);
  }

  // ---------------- DELETE ----------------
  async remove(id: string, user: any): Promise<{ message: string }> {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const isAdmin = user.role === 'admin';
    const isOwner = profile.student.id === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Not allowed');
    }

    await this.profileRepo.remove(profile);

    return { message: 'Profile deleted successfully' };
  }
}