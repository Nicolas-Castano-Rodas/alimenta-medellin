
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-[#F7F6EF] text-[#123B2C]">
      <header className="border-b border-[#DCEBDD] bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6">
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
            Volver al catálogo
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="w-full max-w-2xl rounded-[2.5rem] border border-[#DCEBDD] bg-white px-8 py-16 text-center shadow-sm sm:px-14">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#EAF1E4] text-5xl"
            aria-hidden="true"
          >
            🥬
          </div>

          <p className="mt-8 text-sm font-bold uppercase tracking-widest text-[#4E8B55]">
            Producto no disponible
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            No encontramos este alimento
          </h1>

          <p className="mx-auto mt-5 max-w-md leading-8 text-[#68786D]">
            Es posible que el producto ya no esté disponible,
            se haya agotado o todavía no esté autorizado
            para publicarse en ALIMENTA.
          </p>

          <Link
            href="/explorar"
            className="mt-9 inline-flex items-center justify-center rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white transition hover:bg-[#285843]"
          >
            Explorar alimentos
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#DCEBDD] px-5 py-8 text-center text-sm text-[#68786D]">
        ALIMENTA © 2026 · Medellín, Colombia
      </footer>
    </main>
  );
}
