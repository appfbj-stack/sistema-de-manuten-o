import type { ReactNode } from "react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useSyncStore } from "../../store/syncStore";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const isSyncing = useSyncStore((state) => state.isSyncing);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-100">
      <main className="px-4 pb-24 pt-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-slate-700">
            {isOnline ? "Online" : "Offline"}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
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
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
