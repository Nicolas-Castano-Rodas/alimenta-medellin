
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

import { UserRole } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { Roles } from "./decorators/roles.decorator.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { RolesGuard } from "./roles.guard.js";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("check")
  @Roles(UserRole.ADMIN)
  check() {
    return {
      status: "ok",
      message: "Acceso administrativo autorizado.",
    };
  }

  @Get("businesses/pending")
  @Roles(UserRole.ADMIN)
  async findPendingBusinesses() {
    return this.prisma.business.findMany({
      where: {
        verified: false,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        verified: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
    });
  }

  @Patch("businesses/:id/verify")
  @Roles(UserRole.ADMIN)
  async verifyBusiness(
    @Param("id", new ParseUUIDPipe({ version: "4" }))
    businessId: string,
    @Req() request: Request & {
      user: { id: string; role: string };
    },
  ) {
    const result = await this.prisma.business.updateMany({
      where: {
        id: businessId,
        verified: false,
        ownerId: {
          not: request.user.id,
        },
      },
      data: {
        verified: true,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        "Solicitud pendiente no encontrada o no disponible para aprobación.",
      );
    }

    const business = await this.prisma.business.findUnique({
      where: {
        id: businessId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        verified: true,
        updatedAt: true,
      },
    });

    return {
      message: "Establecimiento aprobado correctamente.",
      business,
    };
  }
}
