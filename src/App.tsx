import { useState, useEffect } from 'react';
import type { Transaction } from './hooks/useBudget';
import { useBudget } from './hooks/useBudget';
import { Link } from 'react-router-dom';
import './App.css';
import { DarkModeToggle } from './components/DarkmodeToggle';

export function App() {
  const {
    caps,
    remaining,
    transactions,
    addTransaction,
    updateTransaction,
    loading,
    error,
  } = useBudget();

  // Form state
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const WARNING_THRESHOLD = 0.1; // 10% of budget remaining
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

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

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setCategory(tx.category);
    setAmount(tx.amount);
    setNote(tx.note || '');
  };

  const handleUpdate = async () => {
    if (!editingTx || !category || amount <= 0) return;
    
    const updatedTx: Transaction = {
      ...editingTx,
      category,
      amount,
      note: note.trim() || undefined,
    };
    
    await updateTransaction(updatedTx);
    
    // Reset form and editing state
    setEditingTx(null);
    setAmount(0);
    setNote('');
  };

  const cancelEdit = () => {
    setEditingTx(null);
    setAmount(0);
    setNote('');
  };

  // Sort transactions by ID descending (newest first)
  // Using optional chaining and fallback values
  const sortedTransactions = [...transactions].sort((a, b) => {
    const idA = a.id || 0;
    const idB = b.id || 0;
    return idB - idA;
  });

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
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded mb-4">
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
    <div className="p-4 max-w-md mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budget Tracker</h1>
        <div className="flex gap-3 items-center">
          <Link to="/raw-data" className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
            📜
          </Link>
          <Link to="/settings" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ⚙️
          </Link>
          <DarkModeToggle />
        </div>
      </header>

      <div className="flex-grow overflow-y-auto pb-4">
        {/* Remaining Budgets */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Remaining Budgets</h2>
          <ul className="space-y-1">
            {Object.entries(remaining).map(([cat, rem]) => {
              const capVal = caps[cat];
              const isOverspent = rem < 0;
              const isClose = !isOverspent && (rem < WARNING_THRESHOLD * capVal);
              const overspentAmount = Math.abs(rem);

              let bgClass = 'bg-gray-100 dark:bg-gray-800';
              let amountClass = 'font-semibold';

              if (isOverspent) {
                bgClass = 'bg-red-100 dark:bg-red-900/30';
                amountClass += ' text-red-600 dark:text-red-400';
              } else if (isClose) {
                bgClass = 'bg-orange-100 dark:bg-orange-900/30';
                amountClass += ' text-orange-600 dark:text-orange-400';
              }

              return (
                <li key={cat} className={`flex justify-between p-2 rounded ${bgClass}`}>
                  <span className="font-medium">{cat}</span>
                  <div className="flex flex-col items-end">
                    {isOverspent && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Cap: ₹{capVal.toFixed(2)}
                      </span>
                    )}
                    <span className={amountClass}>
                      {isOverspent ? (
                        <span className="flex items-center">
                          <span className="text-lg mr-1">▼</span>
                          ₹{overspentAmount.toFixed(2)}
                        </span>
                      ) : (
                        `₹${rem.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Log Expense Form */}
       <section className="mb-6 space-y-3">
          <h2 className="font-semibold">
            {editingTx ? 'Edit Transaction' : 'Log New Expense'}
          </h2>
          
          <div className="grid grid-cols-1 gap-2 mx-1"> {/* Added mx-1 for horizontal margin */}
            <select
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              value={amount > 0 ? amount : ''}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <input
              type="text"
              placeholder="Note (optional)"
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {editingTx ? (
              <>
                <button
                  className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
                  onClick={handleUpdate}
                >
                  Update
                </button>
              </>
            ) : (
              <button
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                onClick={handleLog}
              >
                Log Expense
              </button>
            )}
          </div>
        </section>

        {/* All Transactions */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-xl">Transaction History</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {transactions.length} total
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-gray-600 dark:text-gray-300">
                No transactions yet. Log your first expense above!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTransactions.map((tx, index) => (
                <div
                  key={tx.id || `tx-${index}`}
                  className="
            relative flex items-start gap-4
            p-4
            bg-white dark:bg-gray-800
            border border-gray-100 dark:border-gray-700
            rounded-xl
            shadow-sm hover:shadow-md
            transition-all duration-200 ease-in-out
            overflow-hidden
          "
                >
                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500" />

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{tx.category}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">
                            {tx.date}
                          </span>
                          {tx.note && (
                            <span className="ml-2 truncate italic">"{tx.note}"</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-lg text-red-500 dark:text-red-400 pl-2">
                          -₹{tx.amount.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                          aria-label="Edit transaction"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        Budget Tracker • {new Date().getFullYear()}
      </footer>
    </div>
  );
}