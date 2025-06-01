import { useState } from 'react';
import { Modal } from './Modal';

type CategoryEditorProps = {
  category: string;
  cap: number;
  onUpdate: (oldCat: string, newCat: string, newCap: number) => void;
  onDelete: (category: string) => void;
};

export function CategoryEditor({ category, cap, onUpdate, onDelete }: CategoryEditorProps) {
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(category);
  const [newCap, setNewCap] = useState(cap);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = () => {
    onUpdate(category, newName, newCap);
    setEditMode(false);
  };

  if (editMode) {
    return (
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        />
        <input
          type="number"
          value={newCap}
          onChange={(e) => setNewCap(Number(e.target.value))}
          className="w-24 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          min="0"
          step="0.01"
        />
        <button 
          onClick={handleSave}
          className="px-3 bg-green-500 text-white rounded"
        >
          ✓
        </button>
        <button 
          onClick={() => {
            setEditMode(false);
            setNewName(category);
            setNewCap(cap);
          }}
          className="px-3 bg-gray-500 text-white rounded"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
      <div>
        <span className="font-medium dark:text-white">{category}</span>
        <span className="ml-2 dark:text-gray-300">₹{cap.toFixed(2)}</span>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setEditMode(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Edit
        </button>
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Delete
        </button>
      </div>

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