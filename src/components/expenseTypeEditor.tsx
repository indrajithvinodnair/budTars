import { useState } from 'react';
import { Modal } from './Modal';

interface ExpenseTypeEditorProps {
  type: string;
  onUpdate: (oldType: string, newType: string) => void;
  onDelete: (type: string) => void;
}

export function ExpenseTypeEditor({ type, onUpdate, onDelete }: ExpenseTypeEditorProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newType, setNewType] = useState(type);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      await onUpdate(type, newType);
      setShowEditModal(false);
    } catch (err :any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(type);
      setShowDeleteModal(false);
    } catch (err:any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
      <span className="font-medium dark:text-white">{type}</span>
      <div className="flex gap-2">
        <button
          onClick={() => setShowEditModal(true)}
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

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Expense Type"
        actionButton={{ label: 'Save Changes', onClick: handleSave }}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded mb-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Expense Type Name
            </label>
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
              placeholder="Expense type name"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Expense Type"
        actionButton={{
          label: 'Delete',
          onClick: handleDelete,
          variant: 'danger'
        }}
      >
        <p className="dark:text-white">
          Are you sure you want to delete the "<span className="font-semibold">{type}</span>" expense type?
        </p>
        {error && (
          <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
        )}
        <p className="mt-2 text-red-600 dark:text-red-400">
          You can't delete types that are in use by categories.
        </p>
      </Modal>
    </div>
  );
}