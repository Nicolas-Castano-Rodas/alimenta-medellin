
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

type RegistrationRequest = {
  name: string;
  email: string;
  password: string;
};

function isRegistrationRequest(
  value: unknown,
): value is RegistrationRequest {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.name === "string" &&
    data.name.trim().length >= 2 &&
    data.name.trim().length <= 100 &&
    typeof data.email === "string" &&
    data.email.trim().length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) &&
    typeof data.password === "string" &&
    data.password.length >= 8 &&
    data.password.length <= 128
  );
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Origen de solicitud no autorizado." },
      { status: 403 },
    );
  }

  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return NextResponse.json(
      { message: "Se requiere contenido JSON." },
      { status: 415 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "El cuerpo de la solicitud no es válido." },
      { status: 400 },
    );
  }

  if (!isRegistrationRequest(body)) {
    return NextResponse.json(
      {
        message:
          "Verifica el nombre, correo y contraseña. La contraseña debe tener entre 8 y 128 caracteres.",
      },
      { status: 400 },
    );
  }

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: body.name.trim(),
          email: body.email.trim().toLowerCase(),
          password: body.password,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (apiResponse.status === 409) {
      return NextResponse.json(
        {
          message:
            "No se pudo registrar este correo. Si ya tienes una cuenta, inicia sesión.",
        },
        { status: 409 },
      );
    }

    if (apiResponse.status === 400) {
      return NextResponse.json(
        {
          message:
            "Los datos no cumplen los requisitos de registro.",
        },
        { status: 400 },
      );
    }

    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: "No se pudo completar el registro." },
        { status: 502 },
      );
    }

    const data: unknown = await apiResponse.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("user" in data) ||
      typeof data.user !== "object" ||
      data.user === null ||
      !("id" in data.user) ||
      typeof data.user.id !== "string"
    ) {
      return NextResponse.json(
        {
          message: "El servidor devolvió una respuesta inesperada.",
        },
        { status: 502 },
      );
    }

    const response = NextResponse.json(
      {
        message: "Cuenta creada correctamente.",
      },
      { status: 201 },
    );

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "No fue posible contactar el servicio de registro.",
      },
      { status: 503 },
    );
  }
}
