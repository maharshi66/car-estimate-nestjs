import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    //[1]Check if user exists
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email already in use');
    }

    //[2]Hash user's password
    //* Generate a salt
    const salt = randomBytes(8).toString('hex'); //16 char long
    //*Hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    //*Join the hashed result and salt together
    const result = salt + '.' + hash.toString('hex');

    //[3] Create user and return
    const newUser = await this.usersService.create(email, result);
    return newUser;
  }

  async signIn(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Incorrect password');
    }
    return user;
  }
}
