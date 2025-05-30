import { useState } from 'react';
import { useBudget } from './hooks/useBudget';
import type { Transaction } from './hooks/useBudget';
import { Link } from 'react-router-dom';
import './App.css';

export function App() {
  const {
    caps,
    remaining,
    transactions,
    addTransaction,
  } = useBudget();

  // Form state
  const [category, setCategory] = useState<string>(Object.keys(caps)[0] || '');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  const handleLog = () => {
    if (!category || amount <= 0) return;

    const newTx: Transaction = {
      category,
      amount,
      note: note.trim() || undefined,
      date: new Date().toISOString().slice(0, 10),
    };
    addTransaction(newTx);

    // Reset form
    setAmount(0);
    setNote('');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header with Settings link */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Budget Tracker</h1>
        <Link to="/settings" className="text-blue-600">
          ⚙️
        </Link>
      </header>

      {/* Remaining Budgets */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2">Remaining Budgets</h2>
        <ul className="space-y-1">
          {Object.entries(remaining).map(([cat, rem]) => (
            <li key={cat} className="flex justify-between">
              <span>{cat}</span>
              <span>₹{rem}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Log Expense Form */}
      <section className="mb-6 space-y-2">
        <select
          className="w-full p-2 border rounded"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {Object.keys(caps).map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border rounded"
          value={amount > 0 ? amount : ''}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <input
          type="text"
          placeholder="Note (optional)"
          className="w-full p-2 border rounded"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleLog}
        >
          Log Expense
        </button>
      </section>

      {/* Recent Transactions */}
      <section>
        <h2 className="font-semibold mb-2">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-600">No transactions yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {transactions
              .slice(-5)
              .reverse()
              .map((tx, idx) => (
                <li key={idx}>
                  {tx.date} — {tx.category}: ₹{tx.amount}{' '}
                  {tx.note && <span>({tx.note})</span>}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}