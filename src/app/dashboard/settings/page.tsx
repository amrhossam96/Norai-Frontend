'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import { getAPIKeys, revokeAPIKey, APIKey } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import CreateAPIKeyModal from '@/components/dashboard/CreateAPIKeyModal';

export default function SettingsPage() {
  const { selectedProjectId } = useDashboard();
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    const loadAPIKeys = async () => {
      if (!selectedProjectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const keys = await getAPIKeys(selectedProjectId);
        setAPIKeys(keys);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load API keys');
        setAPIKeys([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAPIKeys();
  }, [selectedProjectId]);

  const handleRevoke = async (keyId: string) => {
    if (!selectedProjectId) return;

    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      setRevokingId(keyId);
      await revokeAPIKey(selectedProjectId, keyId);
      toast.success('API key revoked successfully');
      // Reload keys
      const keys = await getAPIKeys(selectedProjectId);
      setAPIKeys(keys);
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke API key');
    } finally {
      setRevokingId(null);
    }
  };

  const handleKeyCreated = () => {
    // Reload keys after creation
    if (selectedProjectId) {
      getAPIKeys(selectedProjectId).then(setAPIKeys).catch(() => {});
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to manage API keys.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and project settings</p>
      </div>

      {/* API Keys Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">API Keys</h2>
            <p className="text-sm text-gray-400">
              Manage API keys for authenticating requests to the Norai API
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading API keys...</div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-2">No API keys found</p>
            <p className="text-sm text-gray-500">
              Use the button above to create your first API key
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">{key.name}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          key.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>ID: <span className="font-mono text-xs">{key.id}</span></div>
                      <div>Created: {new Date(key.created_at).toLocaleDateString()}</div>
                      {key.last_used_at && (
                        <div>Last used: {new Date(key.last_used_at).toLocaleDateString()}</div>
                      )}
                      {key.revoked_at && (
                        <div className="text-red-400">
                          Revoked: {new Date(key.revoked_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {key.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      disabled={revokingId === key.id}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Revoke API key"
                    >
                      {revokingId === key.id ? (
                        <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-start gap-3 bg-white/5 rounded-lg p-4 border border-white/10">
            <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-400">
              <p className="font-medium text-white mb-1">Security Best Practices</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Never commit API keys to version control</li>
                <li>Rotate keys regularly for better security</li>
                <li>Revoke keys that are no longer needed</li>
                <li>Use different keys for different environments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <CreateAPIKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleKeyCreated}
        projectId={selectedProjectId}
      />
    </div>
  );
}
