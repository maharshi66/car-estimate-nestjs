import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Delete,
  NotFoundException,
  Session,
  UseInterceptors,
  // ClassSerializerInterceptor, //Needed in Nest's way of excluding properties in response object
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/createUser.dto';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import {
  Serialize,
  // SerializeInterceptor,
} from 'src/interceptors/serialize.interceptor';
import { UserDTO } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/create-user.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './users.entity';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
@UseInterceptors(CurrentUserInterceptor)
@Serialize(UserDTO) //Custom decorator - Controller Wide
export class UsersController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('/sign-up')
  async createUser(@Body() body: CreateUserDTO, @Session() session: any) {
    const { email, password } = body;
    const user = await this.authService.signUp(email, password);

    session.userId = user.id;
    return user;
  }

  @Post('/sign-in')
  async signIn(@Body() body: CreateUserDTO, @Session() session: any) {
    const { email, password } = body;
    const user = await this.authService.signIn(email, password);

    session.userId = user.id;
    return user;
  }

  @Post('sign-out')
  signOut(@Session() session: any) {
    session.userId = null;
  }

  // @UseInterceptors(ClassSerializerInterceptor) //*Nest's way of handling/excluding attrs in response
  // @UseInterceptors(new SerializeInterceptor(UserDTO)) //*Without custom decorator, route only
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.userService.findOne(parseInt(id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDTO) {
    return this.userService.update(parseInt(id), body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }
}
