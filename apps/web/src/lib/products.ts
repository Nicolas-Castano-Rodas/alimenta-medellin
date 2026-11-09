
export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  business: string;
  location: string;
  emoji: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Canasta de frutas frescas",
    category: "Frutas y verduras",
    price: 12000,
    originalPrice: 24000,
    business: "Comercio de demostración A",
    location: "Laureles",
    emoji: "🍎",
  },
  {
    id: 2,
    name: "Paquete de pan artesanal",
    category: "Panadería",
    price: 6500,
    originalPrice: 13000,
    business: "Comercio de demostración B",
    location: "Belén",
    emoji: "🥖",
  },
  {
    id: 3,
    name: "Almuerzo del día",
    category: "Restaurantes",
    price: 14000,
    originalPrice: 28000,
    business: "Comercio de demostración C",
    location: "El Poblado",
    emoji: "🥗",
  },
  {
    id: 4,
    name: "Canasta de verduras",
    category: "Frutas y verduras",
    price: 9000,
    originalPrice: 18000,
    business: "Comercio de demostración D",
    location: "Robledo",
    emoji: "🥬",
  },
  {
    id: 5,
    name: "Combo de repostería",
    category: "Panadería",
    price: 8000,
    originalPrice: 16000,
    business: "Comercio de demostración E",
    location: "Buenos Aires",
    emoji: "🥐",
  },
  {
    id: 6,
    name: "Canasta de productos variados",
    category: "Supermercados",
    price: 20000,
    originalPrice: 40000,
    business: "Comercio de demostración F",
    location: "La América",
    emoji: "🛒",
  },
];

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
