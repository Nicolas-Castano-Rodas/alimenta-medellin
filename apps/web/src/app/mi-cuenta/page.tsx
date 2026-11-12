
import type { Metadata } from "next";
import AccountPanel from "./account-panel";

export const metadata: Metadata = {
  title: "Mi cuenta | ALIMENTA",
  description:
    "Consulta los datos de tu cuenta y administra tu sesión en ALIMENTA.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <AccountPanel />;
}
