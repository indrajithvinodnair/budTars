import { useState, useEffect } from 'react';
import type { Transaction } from './hooks/useBudget';
import { useBudget } from './hooks/useBudget';
import { Link } from 'react-router-dom';
import './App.css';

export function App() {
  const {
    caps,
    remaining,
    transactions,
    addTransaction,
    loading,
    error,
  } = useBudget();

  // Form state
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  // Set default category once caps are loaded
  useEffect(() => {
    if (Object.keys(caps).length > 0 && !category) {
      setCategory(Object.keys(caps)[0]);
    }
  }, [caps, category]);

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

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <p>Loading budget data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
        <Link to="/settings" className="block w-full py-3 bg-blue-600 text-white text-center rounded">
          Go to Settings
        </Link>
      </div>
    );
  }

  if (Object.keys(caps).length === 0) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Budget Tracker</h1>
        <p className="mb-6">No budget categories set up yet</p>
        <Link to="/settings" className="py-3 px-6 bg-blue-600 text-white rounded-lg">
          Set Up Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header with Raw Data & Settings links */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budget Tracker</h1>
        <div className="flex gap-4">
          <Link to="/raw-data" className="text-green-600 hover:text-green-800">
            📜 Raw JSON
          </Link>
          <Link to="/settings" className="text-blue-600 hover:text-blue-800">
            ⚙️ Settings
          </Link>
        </div>
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
          onChange={(e) => setCategory(e.target.value)}
        >
          {Object.keys(caps).map((cat) => (
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
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
                <li key={idx} className="flex justify-between">
                  <span>
                    {tx.date} — {tx.category}: ₹{tx.amount}
                  </span>
                  {tx.note && <span className="text-gray-500">({tx.note})</span>}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
