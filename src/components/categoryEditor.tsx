import { useState } from 'react';
import { Modal } from './Modal';
import { type ExpenseType } from '../hooks/useBudget';

interface CategoryEditorProps {
  category: string;
  cap: number;
  type: ExpenseType;
  onUpdate: (oldCat: string, newCat: string, newCap: number, newType: ExpenseType) => void;
  onDelete: (category: string) => void;
}


export function CategoryEditor({ category, cap, type, onUpdate, onDelete }: CategoryEditorProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newName, setNewName] = useState(category);
  const [newCap, setNewCap] = useState(cap);
  const [newType, setNewType] = useState<ExpenseType>(type);

  const handleSave = () => {
    onUpdate(category, newName, newCap, newType);
    setShowEditModal(false);
  };

  return (
    <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
      <div className="overflow-hidden">
        <span className="font-medium dark:text-white truncate block">{category}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm dark:text-gray-300">₹{cap.toFixed(2)}</span>
          <span className="text-xs bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5">
            {type}
          </span>
        </div>

      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowEditModal(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm whitespace-nowrap"
        >
          Edit
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm whitespace-nowrap"
        >
          Delete
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Budget Category"
        actionButton={{ label: 'Save Changes', onClick: handleSave }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Category Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Expense Type
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ExpenseType)}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="Fixed">Fixed</option>
              <option value="Variable">Variable</option>
              <option value="Priority/Investments">Priority/Investments</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Monthly Budget (₹)
            </label>
            <input
              type="number"
              value={newCap}
              onChange={(e) => setNewCap(Number(e.target.value))}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
              min="0"
              step="0.01"
              placeholder="Amount"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Category"
        actionButton={{
          label: 'Delete',
          onClick: () => {
            onDelete(category);
            setShowDeleteModal(false);
          },
          variant: 'danger'
        }}
      >
        <p className="dark:text-white">
          Are you sure you want to delete the "<span className="font-semibold">{category}</span>" category?
        </p>
        <p className="mt-2 text-red-600 dark:text-red-400">
          All transactions in this category will be permanently deleted.
        </p>
      </Modal>
    </div>
  );
}