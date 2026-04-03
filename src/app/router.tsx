import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { ClientesPage } from "../pages/clientes/ClientesPage";
import { EquipamentosPage } from "../pages/equipamentos/EquipamentosPage";
import { OrdensPage } from "../pages/os/OrdensPage";
import { AssinaturaOSPage } from "../pages/os/AssinaturaOSPage";
import { CriarOSPage } from "../pages/os/CriarOSPage";
import { ChecklistOSPage } from "../pages/os/ChecklistOSPage";
import { DetalheOSPage } from "../pages/os/DetalheOSPage";
import { FotosOSPage } from "../pages/os/FotosOSPage";
import { RelatorioOSPage } from "../pages/os/RelatorioOSPage";
import { EquipePage } from "../pages/equipe/EquipePage";

function ConfiguracoesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mais</h1>
      <Link
        to="/equipe"
        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
      >
        <span>Equipe</span>
        <span className="text-slate-400">Abrir</span>
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: (
      <AppShell>
        <DashboardPage />
      </AppShell>
    )
  },
  {
    path: "/clientes",
    element: (
      <AppShell>
        <ClientesPage />
      </AppShell>
    )
  },
  {
    path: "/equipamentos",
    element: (
      <AppShell>
        <EquipamentosPage />
      </AppShell>
    )
  },
  {
    path: "/os",
    element: (
      <AppShell>
        <OrdensPage />
      </AppShell>
    )
  },
  {
    path: "/os/nova",
    element: (
      <AppShell>
        <CriarOSPage />
      </AppShell>
    )
  },
  {
    path: "/os/:id",
    element: (
      <AppShell>
        <DetalheOSPage />
      </AppShell>
    )
  },
  {
    path: "/os/:id/checklist",
    element: (
      <AppShell>
        <ChecklistOSPage />
      </AppShell>
    )
  },
  {
    path: "/os/:id/fotos",
    element: (
      <AppShell>
        <FotosOSPage />
      </AppShell>
    )
  },
  {
    path: "/os/:id/assinaturas",
    element: (
      <AppShell>
        <AssinaturaOSPage />
      </AppShell>
    )
  },
  {
    path: "/os/:id/relatorio",
    element: (
      <AppShell>
        <RelatorioOSPage />
      </AppShell>
    )
  },
  {
    path: "/equipe",
    element: (
      <AppShell>
        <EquipePage />
      </AppShell>
    )
  },
  {
    path: "/configuracoes",
    element: (
      <AppShell>
        <ConfiguracoesPage />
      </AppShell>
    )
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
