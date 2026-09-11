import type { Metadata } from "next";
import { AppShell } from "../components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspecciones de laboratorio",
  description: "Proyecto base de Aplicaciones Web Progresivas"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>
        <AppShell
          title="Inspecciones de laboratorio"
          description="Registro de mantenimiento para trabajar con conectividad intermitente. Los datos mostrados son sintéticos."
          statusLabel="Estado del starter: shell instalable · manifest configurado"
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}

