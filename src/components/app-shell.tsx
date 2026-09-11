import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  title: string;
  description: string;
  statusLabel: string;
}

export function AppShell({ children, title, description, statusLabel }: AppShellProps) {
  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">Proyecto base · Semana 2</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        <span className="status">{statusLabel}</span>
      </header>

      <nav aria-label="Navegación principal" className="app-nav">
        <ul>
          <li><a href="/">Inspecciones</a></li>
          <li>
            <span aria-disabled="true" className="nav-disabled">
              Resumen (próximamente)
            </span>
          </li>
        </ul>
      </nav>

      <main>{children}</main>

      <footer className="footer">
        <p>Aplicaciones Web Progresivas · Universidad Tecnológica de Tehuacán</p>
      </footer>
    </div>
  );
}
