
"use client";

import { useState, type FormEvent } from "react";

type RegisterBusinessFormProps = {
  onCreated: () => void;
};

type ApiResponse = {
  message?: string;
};

export default function RegisterBusinessForm({
  onCreated,
}: RegisterBusinessFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Medellín");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/panel/businesses", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "No pudimos registrar el establecimiento.",
        );
        return;
      }

      setName("");
      setAddress("");
      setCity("Medellín");
      setOpen(false);

      onCreated();
    } catch {
      setError(
        "No pudimos conectar con el servidor. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">
            Establecimientos registrados
          </h2>
          <p className="mt-2 text-sm text-[#68786D]">
            Información asociada a tu cuenta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setOpen((current) => !current);
            setError("");
          }}
          className="rounded-full bg-[#123B2C] px-6 py-3 font-bold text-white transition hover:bg-[#285843]"
        >
          {open ? "Cancelar" : "+ Registrar establecimiento"}
        </button>
      </div>

      {open && (
        <section className="mt-7 rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm sm:p-10">
          <h3 className="text-2xl font-black">
            Nuevo establecimiento
          </h3>

          <p className="mt-3 text-sm leading-6 text-[#68786D]">
            El establecimiento se registrará con estado
            pendiente de verificación. Solo podrá crear
            productos cuando sea aprobado.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-6"
          >
            <div>
              <label
                htmlFor="business-name"
                className="mb-2 block text-sm font-bold"
              >
                Nombre del establecimiento
              </label>

              <input
                id="business-name"
                type="text"
                required
                minLength={3}
                maxLength={150}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Panadería Mi Barrio"
                disabled={loading}
                className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 outline-none focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="business-address"
                className="mb-2 block text-sm font-bold"
              >
                Dirección
              </label>

              <input
                id="business-address"
                type="text"
                required
                minLength={5}
                maxLength={250}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Ej. Calle 10 #20-30"
                disabled={loading}
                className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 outline-none focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="business-city"
                className="mb-2 block text-sm font-bold"
              >
                Ciudad
              </label>

              <input
                id="business-city"
                type="text"
                minLength={2}
                maxLength={100}
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Medellín"
                disabled={loading}
                className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 outline-none focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-[#68786D]">
                Si dejas este campo vacío, el backend utilizará Medellín.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white transition hover:bg-[#285843] disabled:opacity-60"
            >
              {loading
                ? "Registrando establecimiento..."
                : "Registrar establecimiento"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
