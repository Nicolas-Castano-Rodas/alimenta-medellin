
import { ForbiddenException } from "@nestjs/common";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { PrismaService } from "../prisma/prisma.service.js";
import { ProductsService } from "./products.service.js";

describe("ProductsService", () => {
  const findFirst = vi.fn();
  const findMany = vi.fn();
  const create = vi.fn();

  const prisma = {
    business: {
      findFirst,
    },
    product: {
      create,
      findMany,
    },
  } as unknown as PrismaService;

  const service = new ProductsService(prisma);

  const productDto = {
    name: "Combo de Pan Artesanal",
    description: "Paquete de panes del dia",
    category: "Panaderia",
    price: 8500,
    originalPrice: 15000,
    quantity: 10,
    unit: "paquete",
    businessId: "establecimiento-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite registrar productos de un establecimiento propio y aprobado", async () => {
    findFirst.mockResolvedValue({
      id: "establecimiento-1",
    });

    create.mockResolvedValue({
      id: "producto-1",
      ...productDto,
      active: false,
    });

    const result = await service.create(
      "propietario-1",
      productDto,
    );

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "establecimiento-1",
        ownerId: "propietario-1",
        verified: true,
      },
      select: {
        id: true,
      },
    });

    expect(result.active).toBe(false);
  });

  it("crea los productos inicialmente inactivos", async () => {
    findFirst.mockResolvedValue({
      id: "establecimiento-1",
    });

    create.mockResolvedValue({
      id: "producto-1",
      active: false,
    });

    await service.create("propietario-1", productDto);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          active: false,
          quantity: 10,
          businessId: "establecimiento-1",
        }),
      }),
    );
  });

  it("impide crear productos en establecimientos ajenos o no aprobados", async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      service.create("otro-usuario", productDto),
    ).rejects.toThrow(ForbiddenException);

    expect(create).not.toHaveBeenCalled();
  });

  it("rechaza precios de oferta superiores al precio original", async () => {
    findFirst.mockResolvedValue({
      id: "establecimiento-1",
    });

    await expect(
      service.create("propietario-1", {
        ...productDto,
        price: 20000,
        originalPrice: 15000,
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(create).not.toHaveBeenCalled();
  });

  it("solo muestra productos activos, disponibles y de negocios aprobados", async () => {
    findMany.mockResolvedValue([]);

    await service.findAll();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          quantity: {
            gt: 0,
          },
          business: {
            verified: true,
          },
        },
        take: 50,
      }),
    );
  });
});
