import type { ReactNode } from "react";
import { useEffect } from "react";
import { getQueue } from "../lib/db/queue";
import { syncData } from "../lib/db/sync";
import { useSyncStore } from "../store/syncStore";

export function AppProviders({ children }: { children: ReactNode }) {
  const setQueue = useSyncStore((state) => state.setQueue);
  const syncIntervalMs = Number(import.meta.env.VITE_SYNC_INTERVAL_MS || 5000);

  useEffect(() => {
    void getQueue().then((items) => setQueue(items));

    const interval = setInterval(() => {
      void syncData();
    }, syncIntervalMs);

    return () => clearInterval(interval);
  }, [setQueue, syncIntervalMs]);

  return <>{children}</>;
}
