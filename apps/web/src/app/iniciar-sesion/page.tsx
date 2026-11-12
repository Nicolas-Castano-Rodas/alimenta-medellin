
import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | ALIMENTA",
  description:
    "Accede a tu cuenta de ALIMENTA para aprovechar alimentos y conectar con comercios de Medellín.",
};

export default function LoginPage() {
  return <LoginForm />;
}
