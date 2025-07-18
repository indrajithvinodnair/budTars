import { useState, useEffect } from 'react';
import { useBudget } from '../hooks/useBudget';
import { CategoryEditor } from '../components/categoryEditor';
import { Link } from 'react-router-dom';
import { DarkModeToggle } from '../components/DarkmodeToggle';
import { type ExpenseType } from '../hooks/useBudget';
import { ExpenseTypeEditor } from '../components/expenseTypeEditor';

export function Settings() {
  const {
    caps,
    loading,
    error,
    updateCaps,
    updateCategory,
    deleteCategory,
    reloadData,
    expenseTypes,
    addExpenseType,
    updateExpenseType,
    deleteExpenseType
  } = useBudget();
  const [newCategory, setNewCategory] = useState('');
  const [newCap, setNewCap] = useState(0);
  const [newType, setNewType] = useState<ExpenseType>(expenseTypes[0] || '');
  const [newExpenseType, setNewExpenseType] = useState('');

  // Update newType when expenseTypes change
  useEffect(() => {
    if (!expenseTypes.includes(newType)) {
      setNewType(expenseTypes[0] || '');
    }
  }, [expenseTypes]);

  const handleAddCategory = () => {
    if (!newCategory.trim() || newCap <= 0 || !newType) return;
    updateCaps({ ...caps, [newCategory.trim()]: { cap: newCap, type: newType } });
    setNewCategory('');
    setNewCap(0);
    setNewType(expenseTypes[0] || '');
  };
  const handleAddExpenseType = async () => {
    if (!newExpenseType.trim() || expenseTypes.includes(newExpenseType.trim())) return;
    await addExpenseType(newExpenseType.trim());
    setNewExpenseType('');
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Budget Settings</h1>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ↩️ Home
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded">
          {error}
          <button onClick={reloadData} className="ml-2 underline">Try Again</button>
        </div>
      )}

      <section className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="font-semibold text-lg">Data Export</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          View raw budget data for manual backup
        </p>
        <Link
          to="/raw-data"
          className="block w-full py-3 bg-blue-500 text-white text-center rounded"
        >
          View Raw Data
        </Link>
      </section>
      {/* Expense Types Management */}
      <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="font-semibold text-lg">Expense Types</h2>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading expense types...</p>
        ) : expenseTypes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No expense types yet. Add your first one below.</p>
        ) : (
          <div className="space-y-3">
            {expenseTypes.map((type) => (
              <ExpenseTypeEditor
                key={type}
                type={type}
                onUpdate={updateExpenseType}
                onDelete={deleteExpenseType}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <input
            type="text"
            placeholder="New expense type"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            value={newExpenseType}
            onChange={(e) => setNewExpenseType(e.target.value)}
          />
          <button
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddExpenseType}
            disabled={!newExpenseType.trim() || expenseTypes.includes(newExpenseType.trim())}
          >
            Add Expense Type
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          You can't delete types that are in use by a category.
        </p>
      </section>


      <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="font-semibold text-lg">Budget Categories</h2>

        {loading ? (
          <p>Loading categories...</p>
        ) : Object.keys(caps).length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No categories yet. Add your first one below.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(caps).map(([category, capInfo]) => (
              <CategoryEditor
                key={category}
                category={category}
                cap={capInfo.cap}
                type={capInfo.type}
                onUpdate={updateCategory}
                onDelete={deleteCategory}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <input
            type="text"
            placeholder="Category name"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <div className="flex gap-3">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ExpenseType)}
              className="p-3 border rounded-lg bg-white dark:bg-gray-800 flex-1"
            >
              {expenseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              className="flex-1 p-3 border rounded-lg bg-white dark:bg-gray-800"
              value={newCap || ''}
              onChange={(e) => setNewCap(Number(e.target.value))}
              min="0"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              disabled={!newCategory.trim() || newCap <= 0 || !newType}
            >
              Add
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}