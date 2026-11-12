
import { Transform, Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim() : value,
  )
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  category!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  price!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  originalPrice!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  quantity!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  unit!: string;

  @IsUUID("4")
  businessId!: string;
}
