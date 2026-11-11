
import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { describe, expect, it } from "vitest";

import { JwtAuthGuard } from "./jwt-auth.guard.js";

describe("JwtAuthGuard", () => {
  const jwtService = new JwtService({
    secret: "test-secret-only-for-unit-tests-123456789",
    signOptions: {
      algorithm: "HS256",
    },
  });

  const guard = new JwtAuthGuard(jwtService);

  function createContext(authorization?: string) {
    const request = {
      headers: authorization ? { authorization } : {},
    } as Request & {
      user?: { id: string; role: string };
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  it("rechaza solicitudes sin token", async () => {
    const { context } = createContext();

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("acepta un JWT válido", async () => {
    const token = await jwtService.signAsync({
      sub: "usuario-prueba",
      role: "CONSUMER",
    });

    const { context, request } = createContext(
      `Bearer ${token}`,
    );

    await expect(
      guard.canActivate(context),
    ).resolves.toBe(true);

    expect(request.user).toEqual({
      id: "usuario-prueba",
      role: "CONSUMER",
    });
  });

  it("rechaza tokens inválidos", async () => {
    const { context } = createContext(
      "Bearer token-invalido",
    );

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("rechaza tokens expirados", async () => {
    const token = await jwtService.signAsync(
      {
        sub: "usuario-prueba",
        role: "CONSUMER",
      },
      { expiresIn: -1 },
    );

    const { context } = createContext(
      `Bearer ${token}`,
    );

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);
  });
});
