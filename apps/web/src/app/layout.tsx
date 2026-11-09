
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALIMENTA | La comida merece una segunda oportunidad",
  description:
    "Conectamos establecimientos, consumidores y fundaciones para aprovechar alimentos excedentes en Medellín, Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
