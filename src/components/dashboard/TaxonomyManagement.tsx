'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Trash2, Loader2, Tag } from 'lucide-react';
import { getEventTaxonomies, createEventTaxonomy, deleteEventTaxonomy, EventTaxonomy } from '@/lib/api-client';
import { toast } from 'sonner';

export default function TaxonomyManagement() {
  const [taxonomies, setTaxonomies] = useState<EventTaxonomy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [categoryName, setCategoryName] = useState('');
  const [weight, setWeight] = useState('0');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTaxonomies();
  }, []);

  const loadTaxonomies = async () => {
    try {
      setIsLoading(true);
      const data = await getEventTaxonomies();
      setTaxonomies(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load taxonomies');
      setTaxonomies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < -1 || weightNum > 1) {
      toast.error('Weight must be between -1 and 1');
      return;
    }

    setIsCreating(true);

    try {
      await createEventTaxonomy(categoryName.trim(), weightNum, description.trim());
      toast.success('Taxonomy created successfully!');
      setCategoryName('');
      setWeight('0');
      setDescription('');
      setIsModalOpen(false);
      loadTaxonomies();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create taxonomy');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (taxId: string) => {
    if (!confirm('Are you sure you want to delete this taxonomy? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(taxId);
      await deleteEventTaxonomy(taxId);
      toast.success('Taxonomy deleted successfully');
      loadTaxonomies();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete taxonomy');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Event Taxonomies</h2>
        <p className="text-sm text-gray-400">
          Manage taxonomies for categorizing and weighting event types
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <div className="text-gray-400">Loading taxonomies...</div>
          </div>
        </div>
      ) : taxonomies.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 mb-2">No taxonomies found</p>
          <p className="text-sm text-gray-500 mb-4">
            Create a taxonomy to categorize your event types
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all text-sm font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Create Taxonomy</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {taxonomies.map((taxonomy) => (
            <div
              key={taxonomy.id}
              className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold">{taxonomy.category_name}</span>
                    <span className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20">
                      Weight: {taxonomy.weight}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{taxonomy.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(taxonomy.id)}
                  disabled={deletingId === taxonomy.id}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                  title="Delete taxonomy"
                >
                  {deletingId === taxonomy.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Taxonomy Modal */}
      {isModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-md backdrop-blur-xl z-[10001]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Create Taxonomy</h2>
              <p className="text-gray-400 text-sm">
                Create a new taxonomy category for event types
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                  placeholder="e.g., Engagement, Conversion, Navigation"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-2">
                  Weight <span className="text-red-400">*</span>
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="-1"
                  max="1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                />
                <p className="mt-1 text-xs text-gray-500">Range: -1 to 1. Affects recommendation weighting.</p>
              </div>

              <div>
                <label htmlFor="taxDescription" className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="taxDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={5}
                  maxLength={255}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text resize-none"
                  placeholder="Describe this taxonomy category..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !categoryName.trim() || !description.trim()}
                  className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Taxonomy'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

