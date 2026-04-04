import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { useAuthStore } from "../store/authStore";
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
import { ConfiguracoesPage } from "../pages/configuracoes/ConfiguracoesPage";
import { LandingPage } from "../pages/marketing/LandingPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LoginOnlyWhenLoggedOut() {
  const user = useAuthStore((state) => state.user);
  if (user) {
    return <Navigate to="/app" replace />;
  }
  return <LoginPage />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginOnlyWhenLoggedOut />
  },
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <AppShell>
          <DashboardPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/clientes",
    element: (
      <RequireAuth>
        <AppShell>
          <ClientesPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/equipamentos",
    element: (
      <RequireAuth>
        <AppShell>
          <EquipamentosPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/os",
    element: (
      <RequireAuth>
        <AppShell>
          <OrdensPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/os/nova",
    element: (
      <RequireAuth>
        <AppShell>
          <CriarOSPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/os/:id",
    element: (
      <RequireAuth>
        <AppShell>
          <DetalheOSPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/os/:id/checklist",
    element: (
      <RequireAuth>
        <AppShell>
          <ChecklistOSPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/os/:id/fotos",
    element: (
      <RequireAuth>
        <AppShell>
          <FotosOSPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/os/:id/assinaturas",
    element: (
      <RequireAuth>
        <AppShell>
          <AssinaturaOSPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/os/:id/relatorio",
    element: (
      <RequireAuth>
        <AppShell>
          <RelatorioOSPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/equipe",
    element: (
      <RequireAuth>
        <AppShell>
          <EquipePage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "/configuracoes",
    element: (
      <RequireAuth>
        <AppShell>
          <ConfiguracoesPage />
        </AppShell>
      </RequireAuth>
    )
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
