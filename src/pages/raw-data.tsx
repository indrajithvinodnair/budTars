import { useState, useEffect } from 'react';
import { useBudget } from '../hooks/useBudget';
import { Link } from 'react-router-dom';

export function RawData() {
  const { caps, transactions, loading, error } = useBudget();
  const [capsJson, setCapsJson] = useState('');
  const [txJson, setTxJson] = useState('');

  useEffect(() => {
    if (!loading) {
      setCapsJson(JSON.stringify(caps, null, 2));
      setTxJson(JSON.stringify(transactions, null, 2));
    }
  }, [caps, transactions, loading]);

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
        <Link to="/settings" className="text-blue-600 hover:text-blue-800">
          ⚙️ Back to Settings
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Budget Caps</h2>
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <pre 
            className="p-4 overflow-x-auto text-sm"
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
        <h2 className="text-xl font-semibold mb-3">Transactions</h2>
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <pre 
            className="p-4 overflow-x-auto text-sm"
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

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to backup your data</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Select all text in a section (tap and hold, then Select All)</li>
          <li>Copy the text (tap Copy)</li>
          <li>Paste into a text file on your computer</li>
          <li>Repeat for both sections</li>
          <li>Save the files as "budget_caps.json" and "transactions.json"</li>
        </ol>
      </div>
    </div>
  );
}