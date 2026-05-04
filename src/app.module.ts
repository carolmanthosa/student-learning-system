import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from './students/students.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CoursesModule } from './courses/courses.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Manthosa@1956',
      database: 'student_learning_system',
      autoLoadEntities: true,
      synchronize: true,
    }),
    StudentsModule,
    ProfilesModule,
    CoursesModule,
    AssignmentsModule,
    EnrollmentsModule,
  ],
})
export class AppModule {}