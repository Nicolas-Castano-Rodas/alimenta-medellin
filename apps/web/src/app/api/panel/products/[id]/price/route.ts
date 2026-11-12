
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_PRICE = 9999999999.99;

type Context = {
  params: Promise<{ id: string }>;
};

function respond(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function validPrice(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0.01 &&
    value <= MAX_PRICE &&
    Number.isInteger(Math.round(value * 10000) / 100)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Context,
) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return respond({ message: "Origen no autorizado." }, 403);
  }

  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return respond({ message: "Se requiere contenido JSON." }, 415);
  }

  const token = request.cookies.get("alimenta_session")?.value;

  if (!token) {
    return respond({ message: "Debes iniciar sesión." }, 401);
  }

  const { id } = await params;

  if (!UUID_V4.test(id)) {
    return respond({ message: "Identificador inválido." }, 400);
  }

  let body: unknown;

  try {
    const raw = await request.text();

    if (raw.length > 4096) {
      return respond({ message: "Solicitud demasiado grande." }, 413);
    }

    body = JSON.parse(raw) as unknown;
  } catch {
    return respond({ message: "JSON inválido." }, 400);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("price" in body) ||
    !("originalPrice" in body) ||
    !validPrice(body.price) ||
    !validPrice(body.originalPrice) ||
    body.price > body.originalPrice
  ) {
    return respond(
      {
        message:
          "Los precios deben ser positivos, tener máximo dos decimales y la oferta no puede superar el original.",
      },
      400,
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/products/${id}/price`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          price: body.price,
          originalPrice: body.originalPrice,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (response.status === 401) {
      return respond({ message: "Sesión expirada." }, 401);
    }

    if (response.status === 403 || response.status === 404) {
      return respond(
        { message: "Producto no encontrado o no autorizado." },
        response.status,
      );
    }

    if (response.status === 400) {
      return respond({ message: "Precios rechazados por el backend." }, 400);
    }

    if (!response.ok) {
      return respond({ message: "No se pudieron actualizar los precios." }, 502);
    }

    return respond(await response.json(), 200);
  } catch {
    return respond({ message: "No se pudo conectar con NestJS." }, 503);
  }
}
