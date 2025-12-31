'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  itemName: string; // The name that needs to be typed to confirm
  isLoading?: boolean;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  itemName,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const [typedName, setTypedName] = React.useState('');
  const isConfirmed = typedName.trim() === itemName.trim();

  React.useEffect(() => {
    if (!isOpen) {
      setTypedName('');
    }
  }, [isOpen]);

  if (!isOpen || typeof window === 'undefined') return null;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-md backdrop-blur-xl z-[10001]">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label htmlFor="confirm-name" className="block text-sm font-medium text-gray-300 mb-2">
            Type <span className="font-mono text-red-400">{itemName}</span> to confirm:
          </label>
          <input
            id="confirm-name"
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            disabled={isLoading}
            className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 transition-all cursor-text ${
              typedName && !isConfirmed
                ? 'border-red-500/50 focus:border-red-500'
                : isConfirmed
                ? 'border-green-500/50 focus:border-green-500'
                : 'border-white/10 focus:border-white/20'
            }`}
            placeholder={itemName}
            autoComplete="off"
          />
          {typedName && !isConfirmed && (
            <p className="mt-1 text-xs text-red-400">Names do not match</p>
          )}
          {isConfirmed && (
            <p className="mt-1 text-xs text-green-400">✓ Name matches</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !isConfirmed}
            className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

