
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import type { Request } from "express";

import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { BusinessesService } from "./businesses.service.js";
import { CreateBusinessDto } from "./dto/create-business.dto.js";
import { UpdateBusinessDto } from "./dto/update-business.dto.js";

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    role: string;
  };
};

@Controller("businesses")
export class BusinessesController {
  constructor(
    private readonly businessesService: BusinessesService,
  ) {}

  @Get()
  findAll() {
    return this.businessesService.findAll();
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  findMine(@Req() request: AuthenticatedRequest) {
    return this.businessesService.findMine(request.user.id);
  }

  @Get(":id")
  async findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
  ) {
    const business = await this.businessesService.findOne(id);

    if (!business) {
      throw new NotFoundException(
        "El establecimiento solicitado no existe.",
      );
    }

    return business;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessesService.create(
      request.user.id,
      dto,
    );
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" }))
    businessId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessesService.update(
      businessId,
      request.user.id,
      dto,
    );
  }
}
