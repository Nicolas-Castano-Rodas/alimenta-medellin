
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { UserRole } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ROLES_KEY } from "./decorators/roles.decorator.js";

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        "Usuario no autenticado.",
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Usuario no válido.",
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        "No tienes permisos para acceder a este recurso.",
      );
    }

    return true;
  }
}
