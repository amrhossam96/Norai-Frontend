'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Loader2, Tag, FileText, Eye } from 'lucide-react';
import { getEventTaxonomies, getEventTypes, createEventType, createEventTaxonomy, EventTaxonomy, EventType } from '@/lib/api-client';
import { toast } from 'sonner';
import Select from '@/components/ui/select';

interface EventTypeRegistrationProps {
  projectId: string;
  onEventTypeCreated?: () => void;
}

export default function EventTypeRegistration({ projectId, onEventTypeCreated }: EventTypeRegistrationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateTaxonomyModalOpen, setIsCreateTaxonomyModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [taxonomies, setTaxonomies] = useState<EventTaxonomy[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoadingTaxonomies, setIsLoadingTaxonomies] = useState(false);
  const [isLoadingEventTypes, setIsLoadingEventTypes] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingTaxonomy, setIsCreatingTaxonomy] = useState(false);

  // Form state
  const [eventName, setEventName] = useState('');
  const [selectedTaxonomyId, setSelectedTaxonomyId] = useState('');
  const [customWeight, setCustomWeight] = useState('');
  const [description, setDescription] = useState('');

  // Taxonomy form state
  const [taxonomyCategoryName, setTaxonomyCategoryName] = useState('');
  const [taxonomyWeight, setTaxonomyWeight] = useState('0');
  const [taxonomyDescription, setTaxonomyDescription] = useState('');

  const loadTaxonomies = async () => {
    try {
      setIsLoadingTaxonomies(true);
      const data = await getEventTaxonomies();
      setTaxonomies(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load taxonomies');
      setTaxonomies([]);
    } finally {
      setIsLoadingTaxonomies(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      setIsLoadingEventTypes(true);
      const data = await getEventTypes();
      // Filter by project if needed
      const filtered = projectId ? data.filter(et => et.project_id === projectId) : data;
      setEventTypes(filtered || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load event types');
      setEventTypes([]);
    } finally {
      setIsLoadingEventTypes(false);
    }
  };

  useEffect(() => {
    loadEventTypes();
  }, [projectId]);

  useEffect(() => {
    if (isModalOpen) {
      loadTaxonomies();
    } else {
      // Reset form when modal closes
      setEventName('');
      setSelectedTaxonomyId('');
      setCustomWeight('');
      setDescription('');
    }
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName.trim() || !selectedTaxonomyId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      await createEventType(
        projectId,
        eventName.trim(),
        selectedTaxonomyId,
        customWeight ? parseFloat(customWeight) : undefined,
        description.trim() || undefined
      );
      toast.success('Event type registered successfully!');
      setEventName('');
      setSelectedTaxonomyId('');
      setCustomWeight('');
      setDescription('');
      setIsModalOpen(false);
      loadEventTypes(); // Refresh the list
      onEventTypeCreated?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to register event type');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taxonomyCategoryName.trim() || !taxonomyDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const weightNum = parseFloat(taxonomyWeight);
    if (isNaN(weightNum) || weightNum < -1 || weightNum > 1) {
      toast.error('Weight must be between -1 and 1');
      return;
    }

    setIsCreatingTaxonomy(true);

    try {
      await createEventTaxonomy(taxonomyCategoryName.trim(), weightNum, taxonomyDescription.trim());
      toast.success('Taxonomy created successfully!');
      setTaxonomyCategoryName('');
      setTaxonomyWeight('0');
      setTaxonomyDescription('');
      setIsCreateTaxonomyModalOpen(false);
      loadTaxonomies(); // Refresh taxonomies list
    } catch (error: any) {
      toast.error(error.message || 'Failed to create taxonomy');
    } finally {
      setIsCreatingTaxonomy(false);
    }
  };

  const selectedTaxonomy = taxonomies.find(t => t.id === selectedTaxonomyId);

  return (
    <>
      {isLoadingEventTypes ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <div className="text-gray-400">Loading event types...</div>
          </div>
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 mb-2 font-medium">No event types registered yet</p>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Register your first event type to start tracking and categorizing events
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all text-sm font-medium cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Event Type
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Registered Event Types ({eventTypes.length})</h3>
            <div className="flex items-center gap-2">
              {eventTypes.length > 3 && (
                <button
                  onClick={() => setIsViewAllModalOpen(true)}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all text-sm font-medium cursor-pointer flex items-center gap-1.5 text-white"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View All
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all text-sm font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Event Type
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {eventTypes.slice(0, 3).map((eventType) => {
              const taxonomy = taxonomies.find(t => t.id === eventType.taxonomy_id);
              return (
                <div
                  key={eventType.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Tag className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold">{eventType.event_name}</span>
                        {taxonomy && (
                          <span className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20">
                            {taxonomy.category_name}
                          </span>
                        )}
                        {eventType.custom_weight !== undefined && (
                          <span className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20">
                            Weight: {eventType.custom_weight}
                          </span>
                        )}
                      </div>
                      {eventType.description && (
                        <p className="text-sm text-gray-400">{eventType.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-md backdrop-blur-xl z-[10001]">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Register Event Type</h2>
              <p className="text-gray-400 text-sm">
                Register a new event type and assign it to a taxonomy
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                  placeholder="e.g., product_viewed"
                />
                <p className="mt-1 text-xs text-gray-500">Use snake_case (e.g., product_viewed, add_to_cart)</p>
              </div>

              <div>
                <label htmlFor="taxonomy" className="block text-sm font-medium text-gray-300 mb-2">
                  Taxonomy <span className="text-red-400">*</span>
                </label>
                {isLoadingTaxonomies ? (
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-gray-400">Loading taxonomies...</span>
                  </div>
                ) : taxonomies.length === 0 ? (
                  <div className="space-y-3">
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm">
                      No taxonomies available. Create one to continue.
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreateTaxonomyModalOpen(true)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Taxonomy
                    </button>
                  </div>
                ) : (
                  <div>
                    <Select
                      value={selectedTaxonomyId}
                      onChange={setSelectedTaxonomyId}
                      options={taxonomies.map(tax => ({
                        value: tax.id,
                        label: `${tax.category_name} (weight: ${tax.weight})`,
                      }))}
                      placeholder="Select a taxonomy"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsCreateTaxonomyModalOpen(true)}
                        className="text-xs text-gray-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Create New
                      </button>
                    </div>
                  </div>
                )}
                {selectedTaxonomy && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedTaxonomy.description}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customWeight" className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Weight (Optional)
                </label>
                <input
                  id="customWeight"
                  type="number"
                  step="0.01"
                  min="-1"
                  max="1"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                  placeholder="Override taxonomy weight (-1 to 1)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Override the taxonomy weight for this event type. Range: -1 to 1
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={255}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text resize-none"
                  placeholder="Describe this event type..."
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
                  disabled={isCreating || !eventName.trim() || !selectedTaxonomyId || isLoadingTaxonomies}
                  className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register Event Type'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Create Taxonomy Modal */}
      {isCreateTaxonomyModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCreateTaxonomyModalOpen(false)}
          />
          <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-md backdrop-blur-xl z-[10001]">
            <button
              onClick={() => setIsCreateTaxonomyModalOpen(false)}
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

            <form onSubmit={handleCreateTaxonomy} className="space-y-6">
              <div>
                <label htmlFor="taxonomyCategoryName" className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="taxonomyCategoryName"
                  type="text"
                  value={taxonomyCategoryName}
                  onChange={(e) => setTaxonomyCategoryName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                  placeholder="e.g., Engagement, Conversion, Navigation"
                />
              </div>

              <div>
                <label htmlFor="taxonomyWeight" className="block text-sm font-medium text-gray-300 mb-2">
                  Weight <span className="text-red-400">*</span>
                </label>
                <input
                  id="taxonomyWeight"
                  type="number"
                  step="0.01"
                  min="-1"
                  max="1"
                  value={taxonomyWeight}
                  onChange={(e) => setTaxonomyWeight(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                />
                <p className="mt-1 text-xs text-gray-500">Range: -1 to 1. Affects recommendation weighting.</p>
              </div>

              <div>
                <label htmlFor="taxonomyDescription" className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="taxonomyDescription"
                  value={taxonomyDescription}
                  onChange={(e) => setTaxonomyDescription(e.target.value)}
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
                  onClick={() => setIsCreateTaxonomyModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTaxonomy || !taxonomyCategoryName.trim() || !taxonomyDescription.trim()}
                  className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCreatingTaxonomy ? (
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

      {/* View All Event Types Modal */}
      {isViewAllModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsViewAllModalOpen(false)}
          />
          <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-4xl max-h-[90vh] backdrop-blur-xl z-[10001] flex flex-col">
            <button
              onClick={() => setIsViewAllModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="mb-6 flex-shrink-0">
              <h2 className="text-2xl font-bold mb-2">All Event Types ({eventTypes.length})</h2>
              <p className="text-gray-400 text-sm">
                View all registered event types for this project
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {eventTypes.map((eventType) => {
                const taxonomy = taxonomies.find(t => t.id === eventType.taxonomy_id);
                return (
                  <div
                    key={eventType.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Tag className="w-5 h-5 text-gray-400" />
                          <span className="font-semibold">{eventType.event_name}</span>
                          {taxonomy && (
                            <span className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20">
                              {taxonomy.category_name}
                            </span>
                          )}
                          {eventType.custom_weight !== undefined && (
                            <span className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20">
                              Weight: {eventType.custom_weight}
                            </span>
                          )}
                        </div>
                        {eventType.description && (
                          <p className="text-sm text-gray-400">{eventType.description}</p>
                        )}
                        {taxonomy && (
                          <p className="text-xs text-gray-500 mt-2">
                            Taxonomy: {taxonomy.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

