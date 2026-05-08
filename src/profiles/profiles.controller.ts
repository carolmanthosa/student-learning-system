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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  create(@Body() body: CreateProfileDto, @Req() req) {
    return this.profilesService.create(body, req.user);
  }

  @Get()
  findAll(@Req() req) {
    return this.profilesService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.profilesService.findOne(id, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateProfileDto, @Req() req) {
    return this.profilesService.update(id, body, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.profilesService.remove(id, req.user);
  }
}