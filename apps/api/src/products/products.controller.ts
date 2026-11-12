
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import type { Request } from "express";

import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
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
}
