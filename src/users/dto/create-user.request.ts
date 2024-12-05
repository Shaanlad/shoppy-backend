import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsStrongPassword } from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsNumber()
  @Type(() => Number)
  hourlyWorkRate: number;
}
