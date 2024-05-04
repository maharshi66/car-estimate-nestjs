import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core'; //Globally scoped interceptors
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/create-user.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([User])], //*Creates the Repository
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      provide: APP_INTERCEPTOR, //App wide interceptor
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class UsersModule {}
