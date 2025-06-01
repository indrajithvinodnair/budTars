import { useState,useEffect } from 'react';
import { Modal } from './Modal';

type CategoryEditorProps = {
  category: string;
  cap: number;
  onUpdate: (oldCat: string, newCat: string, newCap: number) => void;
  onDelete: (category: string) => void;
};

export function CategoryEditor({ category, cap, onUpdate, onDelete }: CategoryEditorProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newName, setNewName] = useState(category);
  const [newCap, setNewCap] = useState(cap);

  useEffect(() => {
    setNewName(category);
    setNewCap(cap);
  }, [category, cap]);

  const handleSave = () => {
    onUpdate(category, newName, newCap);
    setShowEditModal(false);
  };

  return (
    <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
      <div className="overflow-hidden">
        <span className="font-medium dark:text-white truncate block">{category}</span>
        <span className="text-sm dark:text-gray-300">₹{cap.toFixed(2)}</span>
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
        actionButton={{
          label: 'Save Changes',
          onClick: handleSave
        }}
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
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Category name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Monthly Budget (₹)
            </label>
            <input
              type="number"
              value={newCap}
              onChange={(e) => setNewCap(Number(e.target.value))}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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