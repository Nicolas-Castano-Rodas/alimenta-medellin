
import { FoodDateType, FoodStorageCondition } from "../../generated/prisma/enums.js";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateFoodSafetyDto {
  @IsOptional()
  @IsDateString()
  expirationDate?: string | null;

  @IsOptional()
  @IsEnum(FoodDateType)
  dateType?: FoodDateType;

  @IsOptional()
  @IsEnum(FoodStorageCondition)
  storageCondition?: FoodStorageCondition;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  batchNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  safetyNotes?: string;
}
