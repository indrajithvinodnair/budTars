import { useState, useEffect, useCallback } from 'react';

export type ExpenseType = string;

export interface CapInfo {
  cap: number;
  type: ExpenseType;
}

export type Caps = Record<string, CapInfo>;

export interface Transaction {
  id?: number;
  category: string;
  amount: number;
  note?: string;
  date: string;
  type: ExpenseType;
}

// --- IndexedDB helper: add expenseTypes store and bump version ---
const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('budget-app', 3); // Bump version for schema change

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('caps')) {
        db.createObjectStore('caps');
      }
      if (!db.objectStoreNames.contains('transactions')) {
        const store = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
      }
      if (!db.objectStoreNames.contains('expenseTypes')) {
        db.createObjectStore('expenseTypes');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export function useBudget() {
  const [caps, setCaps] = useState<Caps>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<string[]>([]);
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
      const capsData = await new Promise<Caps>((resolve) => {
        const request = capsStore.get('caps');
        request.onsuccess = () => resolve(request.result || {});
      });

      // Load transactions
      const txTx = db.transaction('transactions', 'readonly');
      const txStore = txTx.objectStore('transactions');
      const txData = await new Promise<Transaction[]>((resolve) => {
        const request = txStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
      });

      // Load expense types
      const typesTx = db.transaction('expenseTypes', 'readonly');
      const typesStore = typesTx.objectStore('expenseTypes');
      const typesData = await new Promise<string[]>((resolve) => {
        const request = typesStore.get('types');
        request.onsuccess = () => resolve(request.result || []);
      });

      // If no types, set default
      let loadedTypes = typesData;
      if (!loadedTypes || loadedTypes.length === 0) {
        loadedTypes = ['Fixed', 'Variable', 'Priority/Investments'];
        const saveTx = db.transaction('expenseTypes', 'readwrite');
        const saveStore = saveTx.objectStore('expenseTypes');
        saveStore.put(loadedTypes, 'types');
      }

      // Migrate old caps if needed
      let migratedCaps = capsData;
      if (capsData && Object.keys(capsData).length > 0 && typeof Object.values(capsData)[0] === 'number') {
        migratedCaps = {};
        for (const [cat, cap] of Object.entries(capsData as unknown as Record<string, number>)) {
          migratedCaps[cat] = { cap, type: 'Fixed' };
        }
        // Save migrated caps
        const saveTx = db.transaction('caps', 'readwrite');
        const saveStore = saveTx.objectStore('caps');
        saveStore.put(migratedCaps, 'caps');
      }

      // Migrate old transactions if needed
      let migratedTransactions = txData;
      if (txData.length > 0 && !('type' in txData[0])) {
        migratedTransactions = txData.map(tx => ({
          ...tx,
          type: 'Fixed'
        }));
        // Save migrated transactions
        const saveTx = db.transaction('transactions', 'readwrite');
        const saveStore = saveTx.objectStore('transactions');
        await saveStore.clear();
        migratedTransactions.forEach(tx => saveStore.add(tx));
      }

      setCaps(migratedCaps);
      setTransactions(migratedTransactions);
      setExpenseTypes(loadedTypes);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Expense Types CRUD ---
  const saveExpenseTypes = useCallback(async (types: string[]) => {
    try {
      const db = await openDB();
      const tx = db.transaction('expenseTypes', 'readwrite');
      const store = tx.objectStore('expenseTypes');
      store.put(types, 'types');
      setExpenseTypes(types);
    } catch (err) {
      console.error('Failed to save expense types:', err);
      setError('Failed to save expense types.');
    }
  }, []);

  const addExpenseType = useCallback(async (type: string) => {
    if (!type.trim() || expenseTypes.includes(type)) return;
    const newTypes = [...expenseTypes, type];
    await saveExpenseTypes(newTypes);
  }, [expenseTypes, saveExpenseTypes]);

  const removeExpenseType = useCallback(async (type: string) => {
    // Optionally: check if any caps/transactions use this type before removing
    const newTypes = expenseTypes.filter(t => t !== type);
    await saveExpenseTypes(newTypes);
  }, [expenseTypes, saveExpenseTypes]);

  // --- Existing code for caps/transactions ---
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
      const newCaps = {};
      await saveCaps(newCaps);
      setCaps(newCaps);

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
    const tempTx = { ...tx, id: -Date.now() };
    setTransactions(prev => [...prev, tempTx]);

    try {
      const id = await saveTransaction(tx);
      setTransactions(prev => prev.map(t => t.id === tempTx.id ? { ...tx, id } : t));
    } catch (err) {
      setTransactions(prev => prev.filter(t => t.id !== tempTx.id));
    }
  }, [saveTransaction]);

  const updateCaps = useCallback(async (newCaps: Caps) => {
    setCaps(newCaps);
    await saveCaps(newCaps);
  }, [saveCaps]);

  const updateCategory = useCallback(async (
    oldCategory: string,
    newCategory: string,
    newCap: number,
    newType: ExpenseType
  ) => {
    const newCaps = { ...caps };
    delete newCaps[oldCategory];
    newCaps[newCategory] = { cap: newCap, type: newType };

    // Update both category and type in transactions if either changes
    const updatedTransactions = transactions.map(tx => {
      if (tx.category === oldCategory) {
        return {
          ...tx,
          category: newCategory,
          type: newType // Always sync type with cap
        };
      }
      return tx;
    });

    setCaps(newCaps);
    setTransactions(updatedTransactions);

    await saveCaps(newCaps);

    const db = await openDB();
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    const requests = updatedTransactions.map(tx => store.put(tx));
    await Promise.all(requests);
  }, [caps, transactions, saveCaps]);

  const deleteCategory = useCallback(async (category: string) => {
    const newCaps = { ...caps };
    delete newCaps[category];
    setCaps(newCaps);
    await saveCaps(newCaps);
  }, [caps, saveCaps]);

  const updateTransaction = useCallback(async (tx: Transaction) => {
    if (tx.id === undefined) {
      throw new Error('Cannot update transaction without ID');
    }

    try {
      const db = await openDB();
      const transaction = db.transaction('transactions', 'readwrite');
      const store = transaction.objectStore('transactions');
      await store.put(tx);

      setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
      return true;
    } catch (err) {
      console.error('Failed to update transaction:', err);
      setError('Failed to update transaction.');
      return false;
    }
  }, []);

  // Compute remaining
  const remaining: Record<string, number> = {};
  Object.entries(caps).forEach(([cat, capInfo]) => {
    const spent = transactions
      .filter(tx => tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0);
    remaining[cat] = capInfo.cap - spent;
  });

  const updateExpenseType = useCallback(async (oldType: string, newType: string) => {
    if (!newType.trim() || expenseTypes.includes(newType)) return;

    try {
      // Update expense types
      const newTypes = expenseTypes.map(t => t === oldType ? newType : t);
      await saveExpenseTypes(newTypes);

      // Update caps using the new type
      const newCaps = { ...caps };
      for (const cat in newCaps) {
        if (newCaps[cat].type === oldType) {
          newCaps[cat] = { ...newCaps[cat], type: newType };
        }
      }
      await saveCaps(newCaps);

      // Update transactions
      const updatedTransactions = transactions.map(tx =>
        tx.type === oldType ? { ...tx, type: newType } : tx
      );

      const db = await openDB();
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      updatedTransactions.forEach(tx => store.put(tx));

      setTransactions(updatedTransactions);
    } catch (err) {
      console.error('Failed to update expense type:', err);
      setError('Failed to update expense type.');
    }
  }, [expenseTypes, caps, transactions, saveExpenseTypes, saveCaps]);

  const deleteExpenseType = useCallback(async (type: string) => {
    // Prevent removing if in use
    const inUse = Object.values(caps).some(c => c.type === type);
    if (inUse) {
      throw new Error('Cannot remove an expense type that is in use by a category.');
    }

    const newTypes = expenseTypes.filter(t => t !== type);
    await saveExpenseTypes(newTypes);
  }, [expenseTypes, caps, saveExpenseTypes]);

  const clearTransactions = useCallback(async () => {
  try {
    const db = await openDB();
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    await store.clear();
    setTransactions([]);
    return true;
  } catch (err) {
    console.error('Failed to clear transactions:', err);
    setError('Failed to clear transactions. Please try again.');
    return false;
  }
}, []);

  return {
    caps,
    remaining,
    transactions,
    loading,
    error,
    expenseTypes,
    addExpenseType,
    removeExpenseType,
    addTransaction,
    updateCaps,
    updateCategory,
    deleteCategory,
    reloadData: loadData,
    updateTransaction,
    clearAllData,
    updateExpenseType,
    deleteExpenseType,
    clearTransactions
  };
}