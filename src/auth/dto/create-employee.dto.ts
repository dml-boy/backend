import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  position: string;

  @IsString()
  department: string;

  @IsString()
  contact: string;
}
