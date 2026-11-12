
import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import type { Request } from "express";

import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { UpdateFoodSafetyDto } from "./dto/update-food-safety.dto.js";
import { UpdateStockDto } from "./dto/update-stock.dto.js";
import { ProductsService } from "./products.service.js";

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    role: string;
  };
};

@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  findMine(@Req() request: AuthenticatedRequest) {
    return this.productsService.findMine(request.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(
      request.user.id,
      dto,
    );
  }

  @Patch(":id/stock")
  @UseGuards(JwtAuthGuard)
  updateStock(
    @Param("id", new ParseUUIDPipe({ version: "4" }))
    productId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateStockDto,
  ) {
    return this.productsService.updateStock(
      productId,
      request.user.id,
      dto,
    );
  }

  @Patch(":id/food-safety")
  @UseGuards(JwtAuthGuard)
  updateFoodSafety(
    @Param("id", new ParseUUIDPipe({ version: "4" }))
    productId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateFoodSafetyDto,
  ) {
    return this.productsService.updateFoodSafety(
      productId,
      request.user.id,
      dto,
    );
  }
}
