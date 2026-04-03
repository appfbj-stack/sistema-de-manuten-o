import { create } from "zustand";

type SyncState = {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  setSyncing: (value: boolean) => void;
  markSynced: () => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncedAt: null,
  setSyncing: (value) => set({ isSyncing: value }),
  markSynced: () => set({ isSyncing: false, lastSyncedAt: new Date().toISOString() })
}));
