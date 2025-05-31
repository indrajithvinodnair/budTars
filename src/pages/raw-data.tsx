import { useState, useEffect } from 'react';
import { useBudget } from '../hooks/useBudget';
import { Link } from 'react-router-dom';
import { DarkModeToggle } from '../components/DarkmodeToggle';

export function RawData() {
  const { caps, transactions, loading, error, clearAllData } = useBudget();
  const [capsJson, setCapsJson] = useState('');
  const [txJson, setTxJson] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    if (!loading) {
      setCapsJson(JSON.stringify(caps, null, 2));
      setTxJson(JSON.stringify(transactions, null, 2));
    }
  }, [caps, transactions, loading]);

  const handleClearAllData = async () => {
    const success = await clearAllData();
    if (success) {
      setShowClearModal(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
        <Link
          to="/settings"
          className="block w-full py-3 bg-blue-600 text-white text-center rounded"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

 return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Raw Budget Data</h1>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ↩️ Home
          </Link>
        </div>
      </div>

      {/* Add Clear Data Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowClearModal(true)}
          className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          disabled={transactions.length === 0 && Object.keys(caps).length === 0}
        >
          Clear All Data
        </button>
      </div>

      {/* Budget Caps Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Budget Caps</h2>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <pre
            className="p-4 overflow-x-auto text-sm text-gray-800 dark:text-gray-200"
            style={{
              maxHeight: '40vh',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {capsJson}
          </pre>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Transactions</h2>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <pre
            className="p-4 overflow-x-auto text-sm text-gray-800 dark:text-gray-200"
            style={{
              maxHeight: '40vh',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {txJson}
          </pre>
        </div>
      </div>

      {/* Backup Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
        <h3 className="font-semibold mb-2">How to backup your data</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Select all text in a section (tap and hold, then Select All)</li>
          <li>Copy the text (tap Copy)</li>
          <li>Paste into a text file on your computer</li>
          <li>Repeat for both sections</li>
          <li>Save the files as "budget_caps.json" and "transactions.json"</li>
        </ol>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-4">Are you sure?</h3>
            <p className="mb-6">This will permanently delete all your budget categories and transactions. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}