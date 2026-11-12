
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type LoginResult = {
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as LoginResult;

      if (!response.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "No fue posible iniciar sesión.",
        );
        return;
      }

      if (!data.user) {
        setError(
          "No se pudo confirmar la sesión del usuario.",
        );
        return;
      }

      // El token permanece en una cookie HttpOnly.
      // Nunca lo guardamos en localStorage.
      setPassword("");

      router.replace("/mi-cuenta");
      router.refresh();
    } catch {
      setError(
        "No fue posible conectar con el servidor. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F6EF] text-[#123B2C]">
      <header className="border-b border-[#123B2C]/10 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            🌿 ALIMENTA
          </Link>

          <Link
            href="/explorar"
            className="rounded-full border border-[#DCEBDD] px-5 py-3 text-sm font-semibold transition hover:bg-[#DCEBDD]"
          >
            Explorar alimentos
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-2">
        <div className="hidden lg:block">
          <span className="inline-flex rounded-full bg-[#DCEBDD] px-5 py-2 text-sm font-bold text-[#285843]">
            Alimenta Medellín
          </span>

          <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight">
            Cada alimento merece
            <span className="block text-[#4E8B55]">
              una segunda oportunidad.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#68786D]">
            Conectamos establecimientos, consumidores y
            fundaciones para reducir el desperdicio de
            alimentos y promover un aprovechamiento
            responsable.
          </p>

          <div className="mt-10 rounded-[2rem] border border-[#DCEBDD] bg-[#EAF1E4] p-8">
            <div className="text-5xl" aria-hidden="true">
              🌱
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Aprovechar también es cuidar.
            </h2>

            <p className="mt-3 leading-7 text-[#68786D]">
              Estamos construyendo una comunidad para
              conectar alimentos disponibles con personas
              y organizaciones que puedan aprovecharlos.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm sm:p-10">
            <div className="mb-8 text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF1E4] text-3xl"
                aria-hidden="true"
              >
                🌿
              </div>

              <h2 className="mt-6 text-3xl font-black">
                Bienvenido de nuevo
              </h2>

              <p className="mt-3 text-[#68786D]">
                Ingresa tus datos para acceder a ALIMENTA.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="correo@ejemplo.com"
                  disabled={loading}
                  className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 outline-none transition focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold"
                >
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Ingresa tu contraseña"
                    disabled={loading}
                    className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 pr-24 outline-none transition focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-4 text-sm font-semibold text-[#4E8B55] hover:text-[#123B2C]"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#123B2C] px-6 py-4 font-bold text-white transition hover:bg-[#285843] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Verificando credenciales..."
                  : "Iniciar sesión"}
              </button>
            </form>

            <div className="mt-8 border-t border-[#E0E8DC] pt-6 text-center text-sm text-[#68786D]">
              ¿Todavía no tienes una cuenta?{" "}
              <Link
                href="/registro"
                className="font-bold text-[#285843] hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-[#68786D]">
            ALIMENTA está en desarrollo. Las reservas y
            compras aún no están habilitadas.
          </p>
        </div>
      </section>
    </main>
  );
}
