
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

const SESSION_COOKIE = "alimenta_session";

function respond(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return respond(
      {
        message: "Debes iniciar sesión para continuar.",
      },
      401,
    );
  }

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL}/businesses/mine`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (apiResponse.status === 401) {
      return respond(
        {
          message: "Tu sesión ha expirado.",
        },
        401,
      );
    }

    if (apiResponse.status === 403) {
      return respond(
        {
          message:
            "No tienes autorización para consultar este recurso.",
        },
        403,
      );
    }

    if (!apiResponse.ok) {
      return respond(
        {
          message:
            "No fue posible consultar tus establecimientos.",
        },
        502,
      );
    }

    const data: unknown = await apiResponse.json();

    return respond(data, 200);
  } catch {
    return respond(
      {
        message:
          "No fue posible conectar con el servicio de establecimientos.",
      },
      503,
    );
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return respond(
      { message: "Origen de solicitud no autorizado." },
      403,
    );
  }

  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return respond(
      { message: "Se requiere contenido JSON." },
      415,
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return respond(
      { message: "Debes iniciar sesión para continuar." },
      401,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return respond(
      { message: "La solicitud contiene datos inválidos." },
      400,
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return respond(
      { message: "Debes proporcionar los datos del establecimiento." },
      400,
    );
  }

  const values = body as Record<string, unknown>;

  const name =
    typeof values.name === "string"
      ? values.name.trim()
      : "";

  const address =
    typeof values.address === "string"
      ? values.address.trim()
      : "";

  const city =
    typeof values.city === "string"
      ? values.city.trim()
      : "";

  if (
    name.length < 3 ||
    name.length > 150 ||
    address.length < 5 ||
    address.length > 250 ||
    (city.length > 0 &&
      (city.length < 2 || city.length > 100))
  ) {
    return respond(
      {
        message:
          "Verifica el nombre, la dirección y la ciudad del establecimiento.",
      },
      400,
    );
  }

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/businesses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        address,
        ...(city ? { city } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (apiResponse.status === 401) {
      return respond(
        { message: "Tu sesión ha expirado." },
        401,
      );
    }

    if (apiResponse.status === 403) {
      return respond(
        { message: "No tienes autorización para registrar establecimientos." },
        403,
      );
    }

    if (apiResponse.status === 400) {
      return respond(
        { message: "El backend rechazó los datos del establecimiento." },
        400,
      );
    }

    if (!apiResponse.ok) {
      return respond(
        { message: "No fue posible registrar el establecimiento." },
        502,
      );
    }

    const result: unknown = await apiResponse.json();

    if (
      typeof result !== "object" ||
      result === null ||
      !("id" in result) ||
      typeof result.id !== "string" ||
      !("verified" in result) ||
      result.verified !== false
    ) {
      return respond(
        { message: "La API devolvió una respuesta inesperada." },
        502,
      );
    }

    return respond(
      {
        message: "Establecimiento registrado. Su verificación está pendiente.",
        business: result,
      },
      201,
    );
  } catch {
    return respond(
      { message: "No fue posible conectar con el servicio de establecimientos." },
      503,
    );
  }
}
