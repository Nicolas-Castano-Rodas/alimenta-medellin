
import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Crear cuenta | ALIMENTA",
  description:
    "Regístrate en ALIMENTA y forma parte de una comunidad que aprovecha mejor los alimentos en Medellín.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
