
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Token de autenticación requerido.",
      );
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new UnauthorizedException(
        "Token de autenticación requerido.",
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: string;
      }>(token, {
        algorithms: ["HS256"],
      });

      if (
        typeof payload.sub !== "string" ||
        typeof payload.role !== "string"
      ) {
        throw new UnauthorizedException("Token inválido.");
      }

      request.user = {
        id: payload.sub,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        "Token inválido o expirado.",
      );
    }
  }
}
