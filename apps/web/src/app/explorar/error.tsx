"use client";

export default function ExploreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F6EF] px-5 text-[#123B2C]">
      <div className="w-full max-w-xl rounded-3xl border border-[#DCEBDD] bg-white p-10 text-center shadow-sm">
        <div className="text-5xl" aria-hidden="true">
          ⚠️
        </div>

        <h1 className="mt-6 text-3xl font-black">
          No pudimos cargar el catálogo
        </h1>

        <p className="mt-4 text-[#68786D]">
          Tenemos dificultades para consultar los alimentos
          disponibles. Intenta nuevamente.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-[#123B2C] px-8 py-3 font-semibold text-white hover:bg-[#285843]"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
