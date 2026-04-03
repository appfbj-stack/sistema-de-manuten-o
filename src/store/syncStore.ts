import { create } from "zustand";

type QueueItem = {
  id?: number;
  type: string;
  createdAt?: string;
};

type SyncState = {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  queue: QueueItem[];
  setSyncing: (value: boolean) => void;
  markSynced: () => void;
  setQueue: (queue: QueueItem[]) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncedAt: null,
  queue: [],
  setSyncing: (value) => set({ isSyncing: value }),
  markSynced: () => set({ isSyncing: false, lastSyncedAt: new Date().toISOString() }),
  setQueue: (queue) => set({ queue })
}));
