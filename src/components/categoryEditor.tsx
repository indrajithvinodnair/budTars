import { useState } from 'react';

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
          className="flex-1 p-2 border rounded"
        />
        <input
          type="number"
          value={newCap}
          onChange={(e) => setNewCap(Number(e.target.value))}
          className="w-24 p-2 border rounded"
        />
        <button 
          onClick={handleSave}
          className="px-3 bg-green-500 text-white rounded"
        >
          ✓
        </button>
        <button 
          onClick={() => setEditMode(false)}
          className="px-3 bg-gray-500 text-white rounded"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
      <div>
        <span className="font-medium">{category}</span>
        <span className="ml-2">₹{cap}</span>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setEditMode(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(category)}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}