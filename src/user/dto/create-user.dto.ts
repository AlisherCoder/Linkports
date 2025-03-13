import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Alex2020' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'Alex123@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Alex123' })
  @IsString()
  password: string;
}

export class LoginUserDto {
  @ApiProperty({ example: 'Alex123@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Alex123' })
  @IsString()
  password: string;
}
