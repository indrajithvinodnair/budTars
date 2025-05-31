import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
  category: string;
  amount: number;
  note?: string;
  date: string;
}

export type Caps = Record<string, number>;

// Simple IndexedDB helper
const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('budget-app', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('caps')) {
        db.createObjectStore('caps');
      }
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export function useBudget() {
  const [caps, setCaps] = useState<Caps>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const db = await openDB();
      
      // Load caps
      const capsTx = db.transaction('caps', 'readonly');
      const capsStore = capsTx.objectStore('caps');
      const capsData = await new Promise<Caps>((resolve, reject) => {
        const request = capsStore.get('caps');
        request.onsuccess = () => resolve(request.result || {});
        request.onerror = () => reject(request.error);
      });
      
      // Load transactions
      const txTx = db.transaction('transactions', 'readonly');
      const txStore = txTx.objectStore('transactions');
      const txData = await new Promise<Transaction[]>((resolve, reject) => {
        const request = txStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      
      setCaps(capsData);
      setTransactions(txData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCaps = useCallback(async (newCaps: Caps) => {
    try {
      const db = await openDB();
      const tx = db.transaction('caps', 'readwrite');
      const store = tx.objectStore('caps');
      store.put(newCaps, 'caps');
    } catch (err) {
      console.error('Failed to save caps:', err);
      setError('Failed to save budget caps.');
    }
  }, []);

  const saveTransaction = useCallback(async (tx: Transaction) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('transactions', 'readwrite');
      const store = transaction.objectStore('transactions');
      store.add(tx);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setError('Failed to save transaction.');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTransaction = useCallback(async (tx: Transaction) => {
    // Update local state immediately for UI responsiveness
    setTransactions(prev => [...prev, tx]);
    // Save to DB
    await saveTransaction(tx);
  }, [saveTransaction]);

  const updateCaps = useCallback(async (newCaps: Caps) => {
    // Update local state
    setCaps(newCaps);
    // Save to DB
    await saveCaps(newCaps);
  }, [saveCaps]);

  const updateCategory = useCallback(async (
    oldCategory: string,
    newCategory: string,
    newCap: number
  ) => {
    // Update caps
    const newCaps = { ...caps };
    delete newCaps[oldCategory];
    newCaps[newCategory] = newCap;
    
    // Update transactions
    const updatedTransactions = transactions.map(tx => 
      tx.category === oldCategory ? { ...tx, category: newCategory } : tx
    );
    
    // Update state
    setCaps(newCaps);
    setTransactions(updatedTransactions);
    
    // Save to DB
    await saveCaps(newCaps);
    
    // Save updated transactions (in a real app, you'd batch update)
    const db = await openDB();
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    await store.clear();
    updatedTransactions.forEach(tx => store.add(tx));
  }, [caps, transactions, saveCaps]);

  const deleteCategory = useCallback(async (category: string) => {
    const newCaps = { ...caps };
    delete newCaps[category];
    setCaps(newCaps);
    await saveCaps(newCaps);
  }, [caps, saveCaps]);

  // Compute remaining
  const remaining: Caps = {};
  Object.entries(caps).forEach(([cat, capVal]) => {
    const spent = transactions
      .filter(tx => tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0);
    remaining[cat] = capVal - spent;
  });

  return {
    caps,
    remaining,
    transactions,
    loading,
    error,
    addTransaction,
    updateCaps,
    updateCategory,
    deleteCategory,
    reloadData: loadData
  };
}