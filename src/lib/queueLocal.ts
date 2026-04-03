import { openDB } from "./indexedDB";

export async function addToQueue(action: any) {
  const db = await openDB();

  const tx = db.transaction("queue", "readwrite");
  const store = tx.objectStore("queue");

  store.add({
    ...action,
    createdAt: new Date().toISOString()
  });

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getQueue() {
  const db = await openDB();

  const tx = db.transaction("queue", "readonly");
  const store = tx.objectStore("queue");

  return new Promise<any[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearQueue() {
  const db = await openDB();

  const tx = db.transaction("queue", "readwrite");
  const store = tx.objectStore("queue");

  store.clear();

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
