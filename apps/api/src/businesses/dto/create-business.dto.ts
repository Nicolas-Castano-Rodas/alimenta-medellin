
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateBusinessDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(250)
  address!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city?: string;
}
