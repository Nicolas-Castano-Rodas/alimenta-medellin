
import type { ExecutionContext } from "@nestjs/common";
import {
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RolesGuard } from "./roles.guard.js";

describe("RolesGuard", () => {
  const getAllAndOverride = vi.fn();
  const findUnique = vi.fn();

  const reflector = {
    getAllAndOverride,
  } as unknown as Reflector;

  const prisma = {
    user: {
      findUnique,
    },
  } as unknown as PrismaService;

  const guard = new RolesGuard(reflector, prisma);

  function createContext(user?: {
    id: string;
    role: string;
  }): ExecutionContext {
    return {
      getHandler: () => () => undefined,
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite una ruta sin restricción de roles", async () => {
    getAllAndOverride.mockReturnValue(undefined);

    await expect(
      guard.canActivate(createContext()),
    ).resolves.toBe(true);

    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rechaza usuarios sin autenticación", async () => {
    getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    await expect(
      guard.canActivate(createContext()),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("rechaza un consumidor en una ruta ADMIN", async () => {
    getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    findUnique.mockResolvedValue({
      role: UserRole.CONSUMER,
    });

    await expect(
      guard.canActivate(
        createContext({
          id: "usuario-1",
          role: UserRole.CONSUMER,
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("permite un administrador autorizado", async () => {
    getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    findUnique.mockResolvedValue({
      role: UserRole.ADMIN,
    });

    await expect(
      guard.canActivate(
        createContext({
          id: "usuario-admin",
          role: UserRole.ADMIN,
        }),
      ),
    ).resolves.toBe(true);
  });

  it("rechaza usuarios eliminados", async () => {
    getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createContext({
          id: "usuario-eliminado",
          role: UserRole.ADMIN,
        }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("utiliza el rol actual de la base de datos", async () => {
    getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    findUnique.mockResolvedValue({
      role: UserRole.CONSUMER,
    });

    await expect(
      guard.canActivate(
        createContext({
          id: "usuario-1",
          role: UserRole.ADMIN,
        }),
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "usuario-1" },
      select: { role: true },
    });
  });
});
