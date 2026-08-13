import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarrasRO · Enciclopedia Pre-Renewal",
  description: "Ocho módulos integrados para comenzar, progresar y explorar BarrasRO.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
