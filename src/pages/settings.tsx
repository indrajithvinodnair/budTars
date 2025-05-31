import { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { CategoryEditor } from '../components/categoryEditor';
import { Link } from 'react-router-dom';
import { DarkModeToggle } from '../components/DarkmodeToggle';

export function Settings() {
  const { 
    caps,
    loading,
    error,
    updateCaps,
    updateCategory,
    deleteCategory,
    reloadData
  } = useBudget();
  
  const [newCategory, setNewCategory] = useState('');
  const [newCap, setNewCap] = useState(0);

  const handleAddCategory = () => {
    if (!newCategory.trim() || newCap <= 0) return;
    updateCaps({ ...caps, [newCategory.trim()]: newCap });
    setNewCategory('');
    setNewCap(0);
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
          <button 
            onClick={reloadData}
            className="ml-2 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Raw Data Link */}
      <section className="space-y-4 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold text-lg">Data Export</h2>
        <p className="text-sm text-gray-600">
          View raw budget data for manual backup
        </p>
        <Link 
          to="/raw-data"
          className="block w-full py-3 bg-blue-500 text-white text-center rounded"
        >
          View Raw Data
        </Link>
      </section>

      {/* Category Management */}
      <section className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold text-lg">Budget Categories</h2>
        
        {loading ? (
          <p>Loading categories...</p>
        ) : Object.keys(caps).length === 0 ? (
          <p className="text-gray-600">No categories yet. Add your first one below.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(caps).map(([category, cap]) => (
              <CategoryEditor
                key={category}
                category={category}
                cap={cap}
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
            className="w-full p-3 border rounded-lg"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Amount"
              className="flex-1 p-3 border rounded-lg"
              value={newCap || ''}
              onChange={(e) => setNewCap(Number(e.target.value))}
              min="0"
            />
            
            <button
              onClick={handleAddCategory}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              disabled={!newCategory.trim() || newCap <= 0}
            >
              Add
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}