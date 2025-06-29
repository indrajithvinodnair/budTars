import { useState, useEffect } from 'react';
import { useBudget } from './hooks/useBudget';
import { Link } from 'react-router-dom';
import './App.css';
import { DarkModeToggle } from './components/DarkmodeToggle';
import type { ExpenseType } from './hooks/useBudget';
import type { Transaction } from './hooks/useBudget';

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

  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [expenseType, setExpenseType] = useState<ExpenseType>('Fixed');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const WARNING_THRESHOLD = 0.1;
  const expenseTypeOptions: ExpenseType[] = ['Fixed', 'Variable', 'Priority/Investments'];

  // Get categories filtered by selected expense type
  const filteredCategories = Object.keys(caps).filter(
    cat => caps[cat].type === expenseType
  );

  // Set default category when type or caps change
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.includes(category)) {
      setCategory(filteredCategories[0]);
    }
  }, [expenseType, caps]);

  const handleLog = () => {
    if (!category || amount <= 0) return;

    const newTx: Transaction = {
      category,
      amount,
      note: note.trim() || undefined,
      date: new Date().toISOString().slice(0, 10),
      type: expenseType,
    };
    addTransaction(newTx);

    setAmount(0);
    setNote('');
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setExpenseType(tx.type);
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
      type: expenseType,
    };

    await updateTransaction(updatedTx);
    setEditingTx(null);
    setAmount(0);
    setNote('');
  };

  const cancelEdit = () => {
    setEditingTx(null);
    setAmount(0);
    setNote('');
  };

  // Group remaining by expense type
  const remainingByType: Record<ExpenseType, Record<string, number>> = {
    Fixed: {},
    Variable: {},
    'Priority/Investments': {},
  };

  Object.entries(remaining).forEach(([cat, amount]) => {
    const type = caps[cat]?.type || 'Fixed';
    remainingByType[type][cat] = amount;
  });

  if (loading) {
    return <div className="p-4 max-w-md mx-auto text-center">Loading budget data...</div>;
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
          {expenseTypeOptions.map(type => {
            const categories = remainingByType[type];
            if (Object.keys(categories).length === 0) return null;
            
            return (
              <div key={type} className="mb-4">
                <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">{type}</h3>
                <ul className="space-y-1">
                  {Object.entries(categories).map(([cat, rem]) => {
                    const capVal = caps[cat]?.cap || 0;
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
              </div>
            );
          })}
        </section>

        {/* Log Expense Form */}
        <section className="mb-6 space-y-3">
          <h2 className="font-semibold">
            {editingTx ? 'Edit Transaction' : 'Log New Expense'}
          </h2>

          <div className="grid grid-cols-1 gap-2 mx-1">
            <select
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
            >
              {expenseTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={filteredCategories.length === 0}
            >
              {filteredCategories.length === 0 ? (
                <option value="">No categories for this type</option>
              ) : (
                filteredCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))
              )}
            </select>

            <input
              type="number"
              placeholder="Amount"
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
              step="0.01"
              value={amount > 0 ? amount : ''}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <input
              type="text"
              placeholder="Note (optional)"
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
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
                disabled={!category || amount <= 0}
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
              {[...transactions]
                .sort((a, b) => (b.id || 0) - (a.id || 0))
                .map((tx) => (
                  <div
                    key={tx.id || `tx-${tx.date}-${tx.amount}`}
                    className="relative flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ease-in-out overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500" />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-lg truncate pr-2">{tx.category}</h3>
                            <div className="font-bold text-lg text-red-500 dark:text-red-400 shrink-0">
                              -₹{tx.amount.toFixed(2)}
                            </div>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded whitespace-nowrap">
                              {tx.date}
                            </span>
                            <span className="bg-blue-100 dark:bg-blue-700/50 px-2 py-0.5 rounded text-xs">
                              {tx.type}
                            </span>
                            {tx.note && (
                              <span className="truncate italic min-w-0 flex-1">
                                "{tx.note}"
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 ml-2"
                          aria-label="Edit transaction"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      <footer className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        Budget Tracker • {new Date().getFullYear()}
      </footer>
    </div>
  );
}