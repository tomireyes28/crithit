import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'cloud@avalanche.com', description: 'Correo electrónico' })
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido' })
  email: string;

  @ApiProperty({ example: 'BusterSword123!', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
