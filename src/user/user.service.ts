import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async findUser(email: string) {
    try {
      let user = await this.userModel.findOne({ email });
      return user;
    } catch (error) {
      return { message: error.message };
    }
  }

  async register(createUserDto: CreateUserDto) {
    let { email, password } = createUserDto;
    try {
      let user = await this.findUser(email);
      if (user) {
        throw new ConflictException();
      }

      let hash = bcrypt.hashSync(password, 10);
      let newUser = {
        ...createUserDto,
        password: hash,
      };

      let created = await this.userModel.create(newUser);
      return { message: created };
    } catch (error) {
      return { message: error.message };
    }
  }

  async login(loginUserDto: LoginUserDto) {
    let { email, password } = loginUserDto;
    try {
      let user = await this.findUser(email);
      if (!user) {
        throw new UnauthorizedException();
      }

      let isValid = bcrypt.compareSync(password, user['password']);
      if (!isValid) {
        throw new BadRequestException();
      }

      let token = this.jwtService.sign({ id: user['_id'], role: user['role'] });

      return { token };
    } catch (error) {
      return { message: error.message };
    }
  }

  async findAll(request: Request) {
    try {
      let user = request['user'];
      if (user.role != 'ADMIN') {
        throw new ForbiddenException('Not allowed');
      }

      let data = await this.userModel.find().populate('cards');
      return { data };
    } catch (error) {
      return { message: error.message };
    }
  }

  async findOne(id: string, request: Request) {
    try {
      let user = request['user'];
      if (user.id != id && user.role != 'ADMIN') {
        throw new ForbiddenException('Not allowed');
      }

      let data = await this.userModel.findById(id).populate('cards');
      if (!data) {
        return { message: 'Not found user' };
      }
      return { data };
    } catch (error) {
      return { message: error.message };
    }
  }

  async update(id: string, request: Request, updateUserDto: UpdateUserDto) {
    try {
      let user = request['user'];
      if (user.id != id && user.role != 'ADMIN') {
        throw new ForbiddenException('Not allowed');
      }

      let data = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
      });
      if (!data) {
        return { message: 'Not found user' };
      }
      return { data };
    } catch (error) {
      return { message: error.message };
    }
  }

  async remove(id: string, request: Request) {
    try {
      let user = request['user'];
      if (user.id != id && user.role != 'ADMIN') {
        throw new ForbiddenException('Not allowed');
      }

      let data = await this.userModel.findByIdAndDelete(id);
      if (!data) {
        return { message: 'Not found user' };
      }
      return { data };
    } catch (error) {
      return { message: error.message };
    }
  }
}
