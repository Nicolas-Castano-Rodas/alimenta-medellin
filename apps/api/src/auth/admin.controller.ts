
import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";

import { UserRole } from "../generated/prisma/enums.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { RolesGuard } from "./roles.guard.js";
import { Roles } from "./decorators/roles.decorator.js";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get("check")
  @Roles(UserRole.ADMIN)
  check() {
    return {
      status: "ok",
      message: "Acceso administrativo autorizado.",
    };
  }
}
