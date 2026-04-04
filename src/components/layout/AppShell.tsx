import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useCompanyProfileStore } from "../../store/companyProfileStore";
import { useAuthStore } from "../../store/authStore";
import { useSyncStore } from "../../store/syncStore";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const companyProfile = useCompanyProfileStore((state) => state.profile);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const queue = useSyncStore((state) => state.queue);
  const pendingCount = queue.length;
  const apiUrl = import.meta.env.VITE_API_URL?.trim();

  useEffect(() => {
    if (!user || !apiUrl) return;

    const companyId =
      import.meta.env.VITE_SUPABASE_COMPANY_ID?.trim() || companyProfile.cnpj.trim() || "empresa-001";

    const validate = async () => {
      try {
        const response = await fetch(`${apiUrl}/billing/access/${encodeURIComponent(companyId)}`);
        if (!response.ok) return;
        const data = (await response.json()) as { accessStatus?: "active" | "inactive" };
        if (data.accessStatus === "inactive") {
          logout();
          alert("Período de teste finalizado. Assinatura pendente para continuar usando.");
          navigate("/login", { replace: true });
        }
      } catch {
        return;
      }
    };

    validate();
    const intervalId = window.setInterval(validate, 60000);
    return () => window.clearInterval(intervalId);
  }, [apiUrl, companyProfile.cnpj, logout, navigate, user]);

  return (
    <div className="mx-auto min-h-screen max-w-md">
      <main className="px-4 pb-24 pt-4">
        <div className="mb-4 space-y-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              {isOnline ? "Online" : "Offline"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isSyncing
                  ? "bg-amber-100 text-amber-800"
                  : isOnline
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-700"
              }`}
            >
              {isSyncing ? "Sincronizando" : isOnline ? "Sincronizado" : "Aguardando conexão"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fila pendente
            </span>
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {pendingCount} item(ns)
            </span>
          </div>

          {pendingCount > 0 ? (
            <div className="space-y-2">
              {queue.slice(0, 3).map((item) => (
                <div
                  key={`${item.id}-${item.createdAt}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                >
                  <span className="text-xs font-semibold text-slate-700">{item.type}</span>
                  <span className="text-[11px] text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString("pt-BR") : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
