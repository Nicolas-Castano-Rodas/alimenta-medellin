
import Link from "next/link";

const categories = [
  { icon: "🥬", name: "Frutas y verduras", detail: "Productos frescos" },
  { icon: "🥖", name: "Panadería", detail: "Pan y repostería" },
  { icon: "🥗", name: "Restaurantes", detail: "Comidas preparadas" },
  { icon: "🛒", name: "Supermercados", detail: "Canastas de alimentos" },
];

const steps = [
  {
    number: "01",
    title: "Descubre",
    description:
      "Encuentra alimentos disponibles cerca de ti y conoce los establecimientos participantes.",
  },
  {
    number: "02",
    title: "Aprovecha",
    description:
      "Accede a oportunidades de ahorro en productos aptos para el consumo.",
  },
  {
    number: "03",
    title: "Transforma",
    description:
      "Contribuye a reducir el desperdicio y a construir una ciudad más sostenible.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F6EF]">
      <div className="bg-[#123B2C] px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        🌱 Medellín, Colombia · Construyendo un futuro sin desperdicio
      </div>

      <header className="border-b border-[#123B2C]/10 bg-[#F7F6EF]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a
            href="#inicio"
            className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#123B2C]"
            aria-label="ALIMENTA - Inicio"
          >
            <span className="text-3xl">🌿</span>
            ALIMENTA
          </a>

          <div className="hidden items-center gap-8 text-sm font-semibold text-[#314A3C] md:flex">
            <a href="#como-funciona" className="hover:text-[#4E8B55]">
              Cómo funciona
            </a>
            <a href="#categorias" className="hover:text-[#4E8B55]">
              Categorías
            </a>
            <a href="#impacto" className="hover:text-[#4E8B55]">
              Nuestro propósito
            </a>
          </div>

          <Link
            href="/explorar"
            className="rounded-full bg-[#123B2C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285843]"
          >
            Explorar
          </Link>
        </nav>
      </header>

      <section
        id="inicio"
        className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28"
      >
        <div className="relative z-10">
          <span className="inline-flex rounded-full border border-[#4E8B55]/30 bg-[#DCEBDD] px-4 py-2 text-sm font-semibold text-[#123B2C]">
            🌎 Alimentando un cambio positivo
          </span>

          <h1 className="mt-8 max-w-2xl text-5xl font-black leading-[1.08] tracking-tight text-[#123B2C] sm:text-6xl lg:text-7xl">
            La comida merece una{" "}
            <span className="text-[#4E8B55]">
              segunda oportunidad.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-[#526359]">
            Conectamos alimentos que aún tienen valor con personas que
            pueden aprovecharlos. Menos desperdicio, más ahorro y
            nuevas oportunidades para Medellín.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="#categorias"
              className="rounded-full bg-[#123B2C] px-8 py-4 text-center font-bold text-white shadow-lg shadow-[#123B2C]/15 transition hover:bg-[#285843]"
            >
              Descubre ALIMENTA ↗
            </a>
            <a
              href="#como-funciona"
              className="rounded-full border border-[#123B2C]/20 px-8 py-4 text-center font-bold text-[#123B2C] transition hover:bg-[#DCEBDD]"
            >
              Cómo funciona
            </a>
          </div>

          <p className="mt-8 text-sm text-[#68786D]">
            Pensado para consumidores, comercios y fundaciones.
          </p>
        </div>

        <div className="relative flex min-h-[400px] items-center justify-center lg:min-h-[520px]">
          <div className="absolute h-[340px] w-[340px] rounded-full bg-[#DCEBDD] blur-2xl sm:h-[440px] sm:w-[440px]" />

          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/70 bg-white/75 p-7 shadow-2xl shadow-[#123B2C]/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#4E8B55]">
                  Un nuevo comienzo
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#123B2C]">
                  Aprovecha más.
                </h2>
              </div>
              <span className="rounded-2xl bg-[#DCEBDD] p-3 text-3xl">
                🌱
              </span>
            </div>

            <div className="my-9 grid grid-cols-3 gap-3">
              {["🥑", "🥖", "🍎", "🥬", "🥕", "🍊"].map(
                (food, index) => (
                  <div
                    key={index}
                    className="flex aspect-square items-center justify-center rounded-2xl bg-[#F1F5E9] text-5xl shadow-sm transition-transform hover:-translate-y-1"
                  >
                    {food}
                  </div>
                ),
              )}
            </div>

            <div className="rounded-2xl bg-[#123B2C] p-5 text-white">
              <p className="text-sm text-[#CAE5D1]">
                Nuestra visión
              </p>
              <p className="mt-2 text-lg font-bold leading-snug">
                Que los buenos alimentos encuentren nuevas oportunidades.
              </p>
            </div>
          </div>

          <div className="absolute -bottom-3 right-0 rounded-2xl bg-white px-5 py-4 shadow-xl sm:right-[-12px]">
            <span className="text-sm font-bold text-[#123B2C]">
              ♻️ Menos desperdicio
            </span>
          </div>
        </div>
      </section>

      <section
        id="categorias"
        className="bg-white px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-bold uppercase tracking-widest text-[#4E8B55]">
              Explora posibilidades
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#123B2C] sm:text-5xl">
              Cada alimento cuenta.
            </h2>
            <p className="mt-5 text-lg text-[#637168]">
              Estas son algunas de las categorías que ALIMENTA
              busca conectar con las personas.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <article
                key={category.name}
                className="rounded-[2rem] border border-[#E4EBE2] bg-[#F7F9F2] p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-8 flex h-24 items-center justify-center rounded-3xl bg-[#DCEBDD] text-6xl">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-[#123B2C]">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-[#65766B]">
                  {category.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="px-5 py-24 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest text-[#4E8B55]">
              Una idea sencilla
            </p>
            <h2 className="mt-3 text-4xl font-black text-[#123B2C] sm:text-5xl">
              Así funcionará ALIMENTA
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-[2rem] border border-[#DCEBDD] bg-white p-9"
              >
                <span className="text-5xl font-black text-[#A8CBAA]">
                  {step.number}
                </span>
                <h3 className="mt-6 text-2xl font-black text-[#123B2C]">
                  {step.title}
                </h3>
                <p className="mt-4 leading-7 text-[#637168]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="impacto" className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-[#123B2C] px-8 py-16 text-center text-white sm:px-16">
          <span className="text-5xl">🌍</span>
          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Hagamos que aprovechar sea mejor que desperdiciar.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#C9DDD0]">
            ALIMENTA nace con el propósito de generar impacto
            ambiental, social y económico conectando a quienes
            tienen alimentos disponibles con quienes pueden
            darles una nueva oportunidad.
          </p>
          <a
            href="#inicio"
            className="mt-9 inline-flex rounded-full bg-white px-8 py-4 font-bold text-[#123B2C] transition hover:bg-[#DCEBDD]"
          >
            Volver al inicio ↑
          </a>
        </div>
      </section>

      <footer className="border-t border-[#123B2C]/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#637168] sm:flex-row">
          <p className="font-bold text-[#123B2C]">
            🌿 ALIMENTA
          </p>
          <p>La comida merece una segunda oportunidad.</p>
          <p>Medellín, Colombia · 2026</p>
        </div>
      </footer>
    </main>
  );
}
