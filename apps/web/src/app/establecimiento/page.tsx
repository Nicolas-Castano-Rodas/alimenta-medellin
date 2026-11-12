
import type { Metadata } from "next";
import BusinessDashboard from "./business-dashboard";

export const metadata: Metadata = {
  title: "Mis establecimientos | ALIMENTA",
  description:
    "Consulta y administra tus establecimientos registrados en ALIMENTA.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BusinessPage() {
  return <BusinessDashboard />;
}
