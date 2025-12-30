'use client';

import { useState } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { createAPIKey, CreateAPIKeyResponse } from '@/lib/api-client';
import { toast } from 'sonner';

interface CreateAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (apiKey: CreateAPIKeyResponse) => void;
  projectId: string;
}

export default function CreateAPIKeyModal({ isOpen, onClose, onSuccess, projectId }: CreateAPIKeyModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreateAPIKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsLoading(true);

    try {
      const apiKey = await createAPIKey(projectId, name);
      setCreatedKey(apiKey);
      onSuccess(apiKey);
      toast.success('API key created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdKey?.apiKey) {
      toast.error('No API key to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(createdKey.apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const handleClose = () => {
    setName('');
    setCreatedKey(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-md backdrop-blur-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {!createdKey ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Create API Key</h2>
              <p className="text-gray-400 text-sm">
                Generate a new API key for your project. You'll only see this key once.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Key Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={255}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                  placeholder="e.g., Production API Key"
                />
                <p className="mt-1 text-xs text-gray-500">Give your API key a descriptive name</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create API Key'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Success State - Show API Key */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">API Key Created</h2>
              <p className="text-gray-400 text-sm">
                Copy this API key now. You won't be able to see it again!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={createdKey?.apiKey || ''}
                    readOnly
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-400">
                  ⚠️ Make sure to copy this key. It will not be shown again.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

