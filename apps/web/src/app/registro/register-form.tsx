
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type RegisterResult = {
  message?: string;
};

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError(
        "La contraseña debe tener entre 8 y 128 caracteres.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as RegisterResult;

      if (!response.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "No se pudo crear tu cuenta.",
        );
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(true);
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
            href="/iniciar-sesion"
            className="rounded-full border border-[#DCEBDD] px-5 py-3 text-sm font-semibold transition hover:bg-[#DCEBDD]"
          >
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-2">
        <div className="hidden lg:block">
          <span className="inline-flex rounded-full bg-[#DCEBDD] px-5 py-2 text-sm font-bold text-[#285843]">
            Únete a ALIMENTA
          </span>

          <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight">
            Juntos podemos
            <span className="block text-[#4E8B55]">
              aprovechar más alimentos.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#68786D]">
            Crea tu cuenta y forma parte de una comunidad
            que busca reducir el desperdicio alimentario
            y generar nuevas oportunidades en Medellín.
          </p>

          <div className="mt-10 rounded-[2rem] border border-[#DCEBDD] bg-[#EAF1E4] p-8">
            <div className="text-5xl" aria-hidden="true">
              🌱
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Pequeñas acciones, grandes cambios.
            </h2>

            <p className="mt-3 leading-7 text-[#68786D]">
              Estamos preparando una plataforma para
              conectar comercios, consumidores y
              organizaciones comprometidas con el
              aprovechamiento responsable de alimentos.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm sm:p-10">
            {success ? (
              <div
                role="status"
                className="py-8 text-center"
              >
                <div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF1E4] text-4xl"
                  aria-hidden="true"
                >
                  ✅
                </div>

                <h1 className="mt-6 text-3xl font-black">
                  ¡Cuenta creada!
                </h1>

                <p className="mt-4 leading-7 text-[#68786D]">
                  Tu registro se completó correctamente.
                  Ahora puedes iniciar sesión con tu
                  correo y contraseña.
                </p>

                <Link
                  href="/iniciar-sesion"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#123B2C] px-6 py-4 font-bold text-white transition hover:bg-[#285843]"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF1E4] text-3xl"
                    aria-hidden="true"
                  >
                    🌿
                  </div>

                  <h1 className="mt-6 text-3xl font-black">
                    Crea tu cuenta
                  </h1>

                  <p className="mt-3 text-[#68786D]">
                    Comienza a formar parte de ALIMENTA.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-bold"
                    >
                      Nombre completo
                    </label>

                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Tu nombre completo"
                      disabled={loading}
                      className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 outline-none transition focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60"
                    />
                  </div>

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
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={128}
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Mínimo 8 caracteres"
                        disabled={loading}
                        className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 pr-24 outline-none transition focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-4 text-sm font-semibold text-[#4E8B55]"
                      >
                        {showPassword
                          ? "Ocultar"
                          : "Mostrar"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-sm font-bold"
                    >
                      Confirmar contraseña
                    </label>

                    <input
                      id="confirm-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Repite tu contraseña"
                      disabled={loading}
                      className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 outline-none transition focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60"
                    />
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
                      ? "Creando cuenta..."
                      : "Crear cuenta"}
                  </button>
                </form>

                <p className="mt-8 border-t border-[#E0E8DC] pt-6 text-center text-sm text-[#68786D]">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/iniciar-sesion"
                    className="font-bold text-[#285843] hover:underline"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </>
            )}
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
