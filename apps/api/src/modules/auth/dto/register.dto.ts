import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'cloud_strife', description: 'Nombre de usuario único' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 24, { message: 'El nombre de usuario debe tener entre 3 y 24 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El nombre de usuario solo puede contener letras, números y guiones bajos',
  })
  username: string;

  @ApiProperty({ example: 'Cloud Strife', description: 'Nombre público para mostrar' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50, { message: 'El nombre para mostrar debe tener entre 2 y 50 caracteres' })
  displayName: string;

  @ApiProperty({ example: 'cloud@avalanche.com', description: 'Correo electrónico válido' })
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido' })
  email: string;

  @ApiProperty({ example: 'BusterSword123!', description: 'Contraseña de al menos 8 caracteres' })
  @IsString()
  @Length(8, 128, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
