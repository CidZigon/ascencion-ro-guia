import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "AscencionRO · Enciclopedia Pre-Renewal",
  description: "Guías y un catálogo de 6.169 objetos para comenzar, progresar y explorar AscencionRO sin depender de consultas externas.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
