import { useEffect, useCallback } from 'react';
import { useStorage } from './useStorage';
import { useFileHandle } from './useFileHandle';
import staticCapsJson from '../data/budget.json';
import staticTxJson from '../data/transactions.json';

export interface Transaction {
  category: string;
  amount: number;
  note?: string;
  date: string;
}

export type Caps = Record<string, number>;

const staticCaps: Caps = staticCapsJson as Caps;
const staticTx: Transaction[] = staticTxJson as Transaction[];

export function useBudget() {
  const [caps, setCaps] = useStorage<Caps>('budgetCaps', staticCaps);
  const [transactions, setTransactions] = 
    useStorage<Transaction[]>('transactions', staticTx);

  const capsFile = useFileHandle('capsFileHandle');
  const txFile = useFileHandle('txFileHandle');

  // Async file writer
  const writeFile = useCallback(
    async (handle: FileSystemFileHandle | null, content: any) => {
      if (!handle) return;
      try {
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(content, null, 2));
        await writable.close();
      } catch (error) {
        console.error('File write error:', error);
      }
    },
    []
  );

  // Write to file when data changes
  useEffect(() => {
    writeFile(capsFile.handle, caps);
  }, [caps, capsFile.handle, writeFile]);

  useEffect(() => {
    writeFile(txFile.handle, transactions);
  }, [transactions, txFile.handle, writeFile]);

  // Compute remaining
  const remaining: Caps = {};
  Object.entries(caps).forEach(([cat, capVal]) => {
    const spent = transactions
      .filter(tx => tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0);
    remaining[cat] = capVal - spent;
  });

  // Add transaction (triggers file write via useEffect)
  const addTransaction = useCallback(
    (tx: Transaction) => {
      const newTx = [...transactions, tx];
      setTransactions(newTx);
    },
    [transactions, setTransactions]
  );

  // Update caps (triggers file write via useEffect)
  const updateCaps = useCallback(
    (newCaps: Caps) => {
      setCaps(newCaps);
    },
    [setCaps]
  );

  return {
    caps,
    remaining,
    transactions,
    addTransaction,
    updateCaps,
    pickCapsFile: capsFile.pick,
    pickTxFile: txFile.pick,
  };
}