
import Image from "next/image";
import Link from "next/link";
import {
  formatPrice,
  type Product,
} from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const discount =
    product.originalPrice > 0
      ? Math.round(
          (1 - product.price / product.originalPrice) * 100,
        )
      : 0;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[#E0E8DC] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/explorar/${product.id}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4E8B55]"
        aria-label={`Ver detalles de ${product.name}`}
      >
        <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#EAF1E4]">
          {product.imagePath ? (
            <Image
              src={product.imagePath}
              alt={`Fotografía ilustrativa de ${product.name}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span
              className="text-8xl transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            >
              {product.emoji}
            </span>
          )}

          {discount > 0 && (
            <span className="absolute left-5 top-5 rounded-full bg-[#123B2C] px-4 py-2 text-sm font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        <div className="p-6">
          <p className="text-sm font-semibold text-[#4E8B55]">
            {product.category}
          </p>

          <h3 className="mt-2 text-xl font-black text-[#123B2C] transition-colors group-hover:text-[#4E8B55]">
            {product.name}
          </h3>

          <div className="mt-4 space-y-1 text-sm text-[#68786D]">
            <p>🏪 {product.business}</p>
            <p>📍 {product.location}, Medellín</p>
            <p>
              📦 Disponibilidad de ejemplo: {product.quantity} {product.unit}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-black text-[#123B2C]">
              {formatPrice(product.price)}
            </span>

            <span className="text-sm text-[#89958B] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          </div>

          <div className="mt-6 rounded-xl bg-[#DCEBDD] px-4 py-3 text-center text-sm font-semibold text-[#123B2C] transition-colors group-hover:bg-[#C5E4C7]">
            Ver detalles del producto
          </div>

          <p className="mt-3 text-center text-xs text-[#68786D]">
            Datos ficticios de demostración
          </p>
        </div>
      </Link>
    </article>
  );
}
