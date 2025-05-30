import { useBudget } from '../hooks/useBudget';

export function Settings() {
  const { pickCapsFile, pickTxFile } = useBudget();

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Settings & File Links</h1>

      <div className="space-y-2">
        <button
          onClick={() => pickCapsFile('budget_caps.json')}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          📂 Choose budget_caps.json
        </button>
        <button
          onClick={() => pickTxFile('transactions.json')}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          📂 Choose transactions.json
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Once you've picked both files, all future changes will be written directly to them.
      </p>
    </div>
  );
}