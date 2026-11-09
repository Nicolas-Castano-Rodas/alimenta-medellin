
export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  business: string;
  location: string;
  emoji: string;
  description: string;
  quantity: number;
  unit: string;
  storage: string;
  pickup: string;
  imagePath?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Canasta de frutas frescas",
    category: "Frutas y verduras",
    imagePath: "/products/frutas.webp",
    price: 12000,
    originalPrice: 24000,
    business: "Comercio de demostración A",
    location: "Laureles",
    emoji: "🍎",
    description:
      "Selección de frutas de temporada para ilustrar una publicación de alimentos excedentes.",
    quantity: 5,
    unit: "canastas",
    storage: "Según las necesidades de cada fruta.",
    pickup: "Recogida en el establecimiento, pendiente de habilitación.",
  },
  {
    id: 2,
    name: "Paquete de pan artesanal",
    category: "Panadería",
    imagePath: "/products/pan.webp",
    price: 6500,
    originalPrice: 13000,
    business: "Comercio de demostración B",
    location: "Belén",
    emoji: "🥖",
    description:
      "Paquete ilustrativo de productos de panadería para aprovechamiento responsable.",
    quantity: 8,
    unit: "paquetes",
    storage: "Según el tipo de pan y las indicaciones del productor.",
    pickup: "Recogida en el establecimiento, pendiente de habilitación.",
  },
  {
    id: 3,
    name: "Almuerzo del día",
    category: "Restaurantes",
    imagePath: "/products/almuerzo.webp",
    price: 14000,
    originalPrice: 28000,
    business: "Comercio de demostración C",
    location: "El Poblado",
    emoji: "🥗",
    description:
      "Ejemplo de comida preparada que podría ofrecerse mediante el marketplace.",
    quantity: 4,
    unit: "porciones",
    storage: "Temperatura y conservación por definir según el alimento.",
    pickup: "Horario de recogida pendiente de definición.",
  },
  {
    id: 4,
    name: "Canasta de verduras",
    category: "Frutas y verduras",
    imagePath: "/products/verduras.webp",
    price: 9000,
    originalPrice: 18000,
    business: "Comercio de demostración D",
    location: "Robledo",
    emoji: "🥬",
    description:
      "Canasta ilustrativa de verduras para consumo doméstico.",
    quantity: 7,
    unit: "canastas",
    storage: "Según las necesidades de cada verdura.",
    pickup: "Recogida en el establecimiento, pendiente de habilitación.",
  },
  {
    id: 5,
    name: "Combo de repostería",
    category: "Panadería",
    imagePath: "/products/reposteria.webp",
    price: 8000,
    originalPrice: 16000,
    business: "Comercio de demostración E",
    location: "Buenos Aires",
    emoji: "🥐",
    description:
      "Selección ilustrativa de productos de repostería, sujetos a condiciones de conservación.",
    quantity: 6,
    unit: "combos",
    storage: "Según ingredientes, rellenos y requisitos del productor.",
    pickup: "Recogida en el establecimiento, pendiente de habilitación.",
  },
  {
    id: 6,
    name: "Canasta de productos variados",
    category: "Supermercados",
    imagePath: "/products/supermercado.webp",
    price: 20000,
    originalPrice: 40000,
    business: "Comercio de demostración F",
    location: "La América",
    emoji: "🛒",
    description:
      "Canasta ilustrativa de diferentes productos para demostrar el marketplace.",
    quantity: 3,
    unit: "canastas",
    storage: "Cada producto requiere condiciones particulares.",
    pickup: "Recogida en el establecimiento, pendiente de habilitación.",
  },
];

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
