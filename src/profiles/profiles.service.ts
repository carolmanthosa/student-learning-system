import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(data: CreateProfileDto): Promise<Profile> {
    const student = await this.studentRepo.findOneBy({ id: data.studentId });
    if (!student) throw new NotFoundException(`Student #${data.studentId} not found`);

    const profile = this.profileRepo.create({
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      student,
    });

    return this.profileRepo.save(profile);
  }

  async findAll(): Promise<Profile[]> {
    return this.profileRepo.find({ relations: ['student'] });
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!profile) throw new NotFoundException(`Profile #${id} not found`);
    return profile;
  }

  async update(id: string, data: UpdateProfileDto): Promise<Profile> {
    await this.findOne(id);
    await this.profileRepo.update(id, {
      bio: data.bio,
      avatarUrl: data.avatarUrl,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.profileRepo.delete(id);
    return { message: `Profile #${id} deleted successfully` };
  }
}