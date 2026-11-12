
import type { Metadata } from "next";
import ProductsDashboard from "./products-dashboard";

export const metadata: Metadata = {
  title: "Mis productos | ALIMENTA",
  description:
    "Consulta los productos e inventario de tus establecimientos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductsPage() {
  return <ProductsDashboard />;
}
