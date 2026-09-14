import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'ID de la pregunta en la base de datos' })
  @IsString()
  @IsNotEmpty({ message: 'El ID de la pregunta es obligatorio' })
  questionId: string;

  @ApiProperty({ description: 'Índice de la opción seleccionada (0 a 3)' })
  @IsInt()
  @Min(0)
  @Max(3)
  selectedOption: number;
}

export class SubmitExamDto {
  @ApiProperty({
    description: 'Lista de respuestas seleccionadas por el aspirante',
    type: [SubmitAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];

  @ApiPropertyOptional({ description: 'Tiempo total empleado en segundos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}

export class StartExamDto {
  @ApiPropertyOptional({
    description: 'Nivel o tipo de examen',
    enum: ['BASIC_CRITIC', 'EXPERT_CRITIC'],
    default: 'BASIC_CRITIC',
  })
  @IsOptional()
  @IsIn(['BASIC_CRITIC', 'EXPERT_CRITIC'])
  examType?: 'BASIC_CRITIC' | 'EXPERT_CRITIC' = 'BASIC_CRITIC';
}
