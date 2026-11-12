
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
  const updateMany = vi.fn();
  const findProduct = vi.fn();

  const prisma = {
    business: {
      findFirst,
    },
    product: {
      create,
      findMany,
      updateMany,
      findFirst: findProduct,
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

  it("consulta únicamente productos de establecimientos propios", async () => {
    findMany.mockResolvedValue([]);

    await service.findMine("propietario-1");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          business: {
            ownerId: "propietario-1",
          },
        },
      }),
    );
  });

  it("permite consultar productos inactivos del propietario", async () => {
    findMany.mockResolvedValue([
      {
        id: "producto-1",
        name: "Combo de Pan Artesanal",
        active: false,
        quantity: 10,
      },
    ]);

    const products = await service.findMine("propietario-1");

    expect(products).toHaveLength(1);
    expect(products[0].active).toBe(false);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          business: {
            ownerId: "propietario-1",
          },
        },
      }),
    );
  });

  it("actualiza el inventario de un producto propio", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValue({
      id: "producto-1",
      name: "Combo de Pan Artesanal",
      quantity: 8,
      active: false,
    });

    const result = await service.updateStock(
      "producto-1",
      "propietario-1",
      { quantity: 8 },
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "producto-1",
        business: {
          ownerId: "propietario-1",
          verified: true,
        },
      },
      data: {
        quantity: 8,
      },
    });

    expect(result).toMatchObject({
      quantity: 8,
      active: false,
    });
  });

  it("impide actualizar productos ajenos o de establecimientos no verificados", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateStock(
        "producto-ajeno",
        "otro-usuario",
        { quantity: 20 },
      ),
    ).rejects.toThrow(
      "Producto no encontrado o no autorizado.",
    );

    expect(findProduct).not.toHaveBeenCalled();
  });

  it("permite establecer el inventario en cero", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValue({
      id: "producto-1",
      quantity: 0,
      active: false,
    });

    const result = await service.updateStock(
      "producto-1",
      "propietario-1",
      { quantity: 0 },
    );

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          quantity: 0,
        },
      }),
    );

    expect(result).toMatchObject({
      quantity: 0,
    });
  });

  it("no modifica el estado de publicación al actualizar existencias", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValue({
      id: "producto-1",
      quantity: 5,
      active: false,
    });

    await service.updateStock(
      "producto-1",
      "propietario-1",
      { quantity: 5 },
    );

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          quantity: 5,
        },
      }),
    );

    const updateArguments = updateMany.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };

    expect(updateArguments.data).not.toHaveProperty("active");
  });
});
