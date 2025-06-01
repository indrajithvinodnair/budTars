import { useState,useEffect } from 'react';
import { useBudget } from '../hooks/useBudget';
import { Link } from 'react-router-dom';
import { DarkModeToggle } from '../components/DarkmodeToggle';
import { Modal } from '../components/Modal';

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
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded mb-4">
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
        <h1 className="text-2xl font-bold dark:text-white">Raw Budget Data</h1>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ↩️ Home
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowClearModal(true)}
          className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          disabled={transactions.length === 0 && Object.keys(caps).length === 0}
        >
          Clear All Data
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 dark:text-white">Budget Caps</h2>
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

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 dark:text-white">Transactions</h2>
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

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
        <h3 className="font-semibold mb-2 dark:text-white">How to backup your data</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm dark:text-gray-300">
          <li>Select all text in a section (tap and hold, then Select All)</li>
          <li>Copy the text (tap Copy)</li>
          <li>Paste into a text file on your computer</li>
          <li>Repeat for both sections</li>
          <li>Save the files as "budget_caps.json" and "transactions.json"</li>
        </ol>
      </div>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data?"
        actionButton={{
          label: 'Clear All Data',
          onClick: handleClearAllData,
          variant: 'danger'
        }}
      >
        <p className="dark:text-white">
          This will permanently delete all your budget categories and transactions.
        </p>
        <p className="mt-2 text-red-600 dark:text-red-400">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}