import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['admin', 'employee'], { message: 'Role must be either admin or employee' })
  role: 'admin' | 'employee';
}
