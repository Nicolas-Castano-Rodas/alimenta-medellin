"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthStatus = "loading" | "authenticated" | "guest";

export default function AuthNavigation() {
  const router = useRouter();

  const [status, setStatus] = useState<AuthStatus>("loading");
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setStatus(
            response.ok ? "authenticated" : "guest",
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus("guest");
        }
      }
    }

    void checkSession();

    return () => controller.abort();
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión.");
      }

      setStatus("guest");
      router.replace("/");
      router.refresh();
    } catch {
      setError("No se pudo cerrar la sesión. Intenta de nuevo.");
    } finally {
      setLoggingOut(false);
    }
  }

  if (status === "loading") {
    return (
      <span className="text-sm text-white/70" role="status">
        Verificando sesión...
      </span>
    );
  }

  if (status === "guest") {
    return (
      <nav
        aria-label="Acceso de usuarios"
        className="flex flex-wrap items-center gap-3"
      >
        <Link
          href="/iniciar-sesion"
          className="text-sm font-semibold text-white hover:underline"
        >
          Iniciar sesión
        </Link>

        <Link
          href="/registro"
          className="rounded-full bg-[#DCEBDD] px-4 py-2 text-sm font-bold text-[#123B2C]"
        >
          Registrarse
        </Link>
      </nav>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/mi-cuenta"
        className="text-sm font-semibold text-white hover:underline"
      >
        Mi cuenta
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-full bg-[#DCEBDD] px-4 py-2 text-sm font-bold text-[#123B2C] disabled:opacity-60"
      >
        {loggingOut ? "Cerrando..." : "Cerrar sesión"}
      </button>

      {error && (
        <p role="alert" className="w-full text-xs text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
