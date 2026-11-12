
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "alimenta_session";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json(
      {
        message: "Origen de solicitud no autorizado.",
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const response = NextResponse.json(
    {
      message: "Sesión cerrada correctamente.",
      authenticated: false,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Clear-Site-Data": '"storage"',
      },
    },
  );

  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
