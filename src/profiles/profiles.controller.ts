import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // 👇 CREATE PROFILE (student or admin)
  @Post()
  create(@Body() body: CreateProfileDto, @Req() req) {
    return this.profilesService.create(body, req.user);
  }

  // 👇 GET ALL (admin sees all, student sees own)
  @Get()
  findAll(@Req() req) {
    return this.profilesService.findAll(req.user);
  }

  // 👇 GET ONE (ownership protected)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.profilesService.findOne(id, req.user);
  }

  // 👇 UPDATE (ownership + admin allowed)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateProfileDto, @Req() req) {
    return this.profilesService.update(id, body, req.user);
  }

  // 👇 DELETE (ownership + admin allowed)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.profilesService.remove(id, req.user);
  }
}