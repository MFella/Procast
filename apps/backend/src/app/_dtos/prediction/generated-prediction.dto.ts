import { IsArray, IsNotEmpty } from 'class-validator';

export class GeneratedPredictionDTO {
  @IsArray()
  @IsNotEmpty()
  result: [number, number];
}
