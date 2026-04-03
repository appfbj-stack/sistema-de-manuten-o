import { clearQueue, getQueue } from "./queue";
import { useSyncStore } from "../../store/syncStore";

export async function syncData() {
  if (!navigator.onLine) return;

  useSyncStore.getState().setSyncing(true);

  const queue: any[] = await getQueue();

  if (!queue.length) {
    useSyncStore.getState().markSynced();
    return;
  }

  console.log("Sincronizando...", queue);

  for (const item of queue) {
    try {
      console.log("Enviando:", item);
    } catch (err) {
      useSyncStore.getState().setSyncing(false);
      console.error("Erro ao sincronizar", err);
      return;
    }
  }

  await clearQueue();

  useSyncStore.getState().markSynced();
  console.log("Sincronização concluída");
}
