import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { Student } from '../students/entities/student.entity';
import { CreateProfileDto } from './dto/create-profile.dto'; // ✅ added
import { UpdateProfileDto } from './dto/update-profile.dto'; // ✅ added

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  async create(data: CreateProfileDto) { // ✅ data: any → CreateProfileDto
    const student = await this.studentRepo.findOneBy({ id: data.studentId });
    if (!student) throw new NotFoundException(`Student #${data.studentId} not found`);

    const profile = this.profileRepo.create({
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      student: student,
    });

    return this.profileRepo.save(profile);
  }

  findAll() {
    return this.profileRepo.find({ relations: ['student'] });
  }

  async findOne(id: number) {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!profile) throw new NotFoundException(`Profile #${id} not found`);
    return profile;
  }

  async update(id: number, data: UpdateProfileDto) { // ✅ data: any → UpdateProfileDto
    await this.findOne(id);
    await this.profileRepo.update(id, {
      bio: data.bio,
      avatarUrl: data.avatarUrl,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.profileRepo.delete(id);
  }
}