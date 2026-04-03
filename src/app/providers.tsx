import type { ReactNode } from "react";
import { useEffect } from "react";
import { syncData } from "../lib/db/sync";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    const interval = setInterval(() => {
      syncData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
