import { useState, useEffect } from 'react';

declare global {
  interface Window {
    showSaveFilePicker?: (
      opts: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;
  }
}

type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
};

// Simple IndexedDB helper
const idb = {
  async get(key: string): Promise<FileSystemFileHandle | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('FileHandlesDB', 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('handles', 'readonly');
        const store = tx.objectStore('handles');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  },
  async set(key: string, value: FileSystemFileHandle): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FileHandlesDB', 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('handles', 'readwrite');
        const store = tx.objectStore('handles');
        store.put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  },
};

export function useFileHandle(key: string) {
  const [handle, setHandle] = useState<FileSystemFileHandle | null>(null);

  // Restore handle from IndexedDB on mount
  useEffect(() => {
    (async () => {
      if (window.showSaveFilePicker) {
        const savedHandle = await idb.get(key);
        if (savedHandle) {
          // Verify permissions
          if (await verifyPermission(savedHandle, true)) {
            setHandle(savedHandle);
          }
        }
      }
    })();
  }, [key]);

  const verifyPermission = async (
    handle: FileSystemFileHandle,
    readWrite: boolean
  ) => {
    const options = { mode: readWrite ? 'readwrite' : 'read' } as const;
    
    // Check if methods exist before calling
    if (typeof (handle as any).queryPermission === 'function') {
      if ((await (handle as any).queryPermission(options)) === 'granted') return true;
    }
    
    if (typeof (handle as any).requestPermission === 'function') {
      return (await (handle as any).requestPermission(options)) === 'granted';
    }
    
    // Fallback: Assume permission is granted if methods don't exist
    return true;
  };

  const pick = async (suggestedName: string) => {
    if (!window.showSaveFilePicker) {
      throw new Error('File System Access API not supported');
    }
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{
        description: 'JSON File',
        accept: { 'application/json': ['.json'] },
      }],
    });
    
    // Verify and store handle
    if (await verifyPermission(handle, true)) {
      setHandle(handle);
      await idb.set(key, handle);
      return handle;
    }
    throw new Error('Permission denied');
  };

  return { handle, pick };
}