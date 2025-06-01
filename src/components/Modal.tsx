import { type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'danger' | 'primary';
  };
}

export function Modal({ isOpen, onClose, title, children, actionButton }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="mb-6">{children}</div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className={`px-4 py-2 rounded ${
                actionButton.variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {actionButton.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}