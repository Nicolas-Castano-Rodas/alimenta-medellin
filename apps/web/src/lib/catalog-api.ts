
import "server-only";

export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: string;
  originalPrice: string;
  quantity: number;
  unit: string;
  imagePath: string | null;
  business: {
    id: string;
    name: string;
    city: string;
  };
};

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

export async function getCatalogProducts(): Promise<
  CatalogProduct[]
> {
  const response = await fetch(
    `${API_BASE_URL}/products`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `No se pudo consultar el catálogo. HTTP ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "La API devolvió un formato de catálogo inesperado.",
    );
  }

  return data as CatalogProduct[];
}

export type CatalogProductDetail = CatalogProduct & {
  storageCondition: "AMBIENT" | "REFRIGERATED" | "FROZEN" | null;
};

export async function getCatalogProductById(
  id: string,
): Promise<CatalogProductDetail | null> {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(id)}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `No se pudo consultar el producto. HTTP ${response.status}`,
    );
  }

  return (await response.json()) as CatalogProductDetail;
}
