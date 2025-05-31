import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
  id?: number; 
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

  const saveTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('transactions', 'readwrite');
      const store = transaction.objectStore('transactions');
      const id = await new Promise<number>((resolve, reject) => {
        const request = store.add(tx);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
      });
      return id;
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setError('Failed to save transaction.');
      throw err;
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      // Clear caps
      const newCaps = {};
      await saveCaps(newCaps);
      setCaps(newCaps);
      
      // Clear transactions
      const db = await openDB();
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      await store.clear();
      setTransactions([]);
      
      return true;
    } catch (err) {
      console.error('Failed to clear data:', err);
      setError('Failed to clear data. Please try again.');
      return false;
    }
  }, [saveCaps]);

  useEffect(() => {
    loadData();
  }, [loadData]);

 const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    // Create temporary transaction with a negative ID for optimistic UI
    const tempTx = { ...tx, id: -Date.now() };
    setTransactions(prev => [...prev, tempTx]);
    
    try {
      // Save to DB and get real ID
      const id = await saveTransaction(tx);
      // Replace temporary transaction with real one
      setTransactions(prev => prev.map(t => t.id === tempTx.id ? { ...tx, id } : t));
    } catch (err) {
      // Remove temporary transaction if save failed
      setTransactions(prev => prev.filter(t => t.id !== tempTx.id));
    }
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
const updateTransaction = useCallback(async (tx: Transaction) => {
    if (tx.id === undefined) {
      throw new Error('Cannot update transaction without ID');
    }
    
    try {
      const db = await openDB();
      const transaction = db.transaction('transactions', 'readwrite');
      const store = transaction.objectStore('transactions');
      await store.put(tx); // Update the transaction
      
      // Update state
      setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
      return true;
    } catch (err) {
      console.error('Failed to update transaction:', err);
      setError('Failed to update transaction.');
      return false;
    }
  }, []);

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
    reloadData: loadData,
    updateTransaction,
    clearAllData
  };
}