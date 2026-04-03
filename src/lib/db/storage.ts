import { openDB } from "./indexedDB";

export async function saveOSLocal(os: any) {
  const db = await openDB();

  const tx = db.transaction("os", "readwrite");
  const store = tx.objectStore("os");

  store.put(os);

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getAllOSLocal() {
  const db = await openDB();

  const tx = db.transaction("os", "readonly");
  const store = tx.objectStore("os");

  return new Promise<any[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
