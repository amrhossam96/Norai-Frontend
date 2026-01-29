'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { 
  createFunnel, 
  getEventTypes, 
  createEventType,
  EventType
} from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import Select from '@/components/ui/select';
import EventTypeSelect from '@/components/dashboard/EventTypeSelect';

interface CreateFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFunnelModal({ isOpen, onClose, onSuccess }: CreateFunnelModalProps) {
  const { selectedProjectId } = useDashboard();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<Array<{ event_type_id: string }>>([{ event_type_id: '' }]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEventTypes, setIsLoadingEventTypes] = useState(false);
  
  // Event type creation state
  const [isCreateEventTypeModalOpen, setIsCreateEventTypeModalOpen] = useState(false);
  const [createEventTypeStepIndex, setCreateEventTypeStepIndex] = useState<number | null>(null);
  const [isCreatingEventType, setIsCreatingEventType] = useState(false);
  
  // Event type form state
  const [eventTypeName, setEventTypeName] = useState('');
  const [eventTypeDescription, setEventTypeDescription] = useState('');

  useEffect(() => {
    if (isOpen && selectedProjectId) {
      loadEventTypes();
    }
  }, [isOpen, selectedProjectId]);

  const loadEventTypes = async () => {
    if (!selectedProjectId) return;
    
    try {
      setIsLoadingEventTypes(true);
      const types = await getEventTypes();
      // Filter by project
      const filtered = types.filter(et => et.project_id === selectedProjectId);
      setEventTypes(filtered || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load event types');
    } finally {
      setIsLoadingEventTypes(false);
    }
  };

  const handleOpenCreateEventType = (stepIndex: number) => {
    setCreateEventTypeStepIndex(stepIndex);
    setIsCreateEventTypeModalOpen(true);
  };

  const handleCreateEventType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }

    if (!eventTypeName.trim()) {
      toast.error('Please enter an event name');
      return;
    }

    setIsCreatingEventType(true);

    try {
      const newEventType = await createEventType(
        selectedProjectId,
        eventTypeName.trim(),
        eventTypeDescription.trim() || undefined
      );
      
      toast.success('Event type created successfully!');
      
      // Reload event types
      await loadEventTypes();
      
      // Auto-select the newly created event type in the step
      if (createEventTypeStepIndex !== null) {
        handleStepChange(createEventTypeStepIndex, newEventType.id);
      }
      
      // Reset form
      setEventTypeName('');
      setEventTypeDescription('');
      setIsCreateEventTypeModalOpen(false);
      setCreateEventTypeStepIndex(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event type');
    } finally {
      setIsCreatingEventType(false);
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, { event_type_id: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, eventTypeId: string) => {
    const newSteps = [...steps];
    newSteps[index] = { event_type_id: eventTypeId };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a funnel name');
      return;
    }

    // Filter out empty steps
    const validSteps = steps.filter(step => step.event_type_id.trim() !== '');
    
    if (validSteps.length === 0) {
      toast.error('Please add at least one step to the funnel');
      return;
    }

    try {
      setIsLoading(true);
      await createFunnel(selectedProjectId, name.trim(), validSteps, description.trim() || undefined);
      toast.success('Funnel created successfully');
      setName('');
      setDescription('');
      setSteps([{ event_type_id: '' }]);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create funnel');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create Funnel</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Funnel Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Checkout Flow"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of the funnel"
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text resize-none"
            />
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                Funnel Steps *
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
            
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <EventTypeSelect
                      value={step.event_type_id}
                      onChange={(value) => handleStepChange(index, value)}
                      options={eventTypes}
                      placeholder={isLoadingEventTypes ? "Loading event types..." : "Select event type"}
                      disabled={isLoadingEventTypes}
                      onRegisterNew={() => handleOpenCreateEventType(index)}
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {eventTypes.length === 0 && !isLoadingEventTypes && (
              <div className="text-sm text-gray-500 mt-2">
                <p className="mb-2">No event types available. Register event types to use in your funnel.</p>
                <button
                  type="button"
                  onClick={() => handleOpenCreateEventType(0)}
                  className="text-white hover:text-white/80 underline cursor-pointer"
                >
                  Register your first event type
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || steps.every(s => !s.event_type_id)}
              className="px-6 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Creating...' : 'Create Funnel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Create Event Type Modal
  const createEventTypeModal = isCreateEventTypeModalOpen && typeof window !== 'undefined' ? (
    createPortal(
      <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setIsCreateEventTypeModalOpen(false);
            setCreateEventTypeStepIndex(null);
          }}
        />
        <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Register Event Type</h2>
            <button
              onClick={() => {
                setIsCreateEventTypeModalOpen(false);
                setCreateEventTypeStepIndex(null);
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateEventType} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                value={eventTypeName}
                onChange={(e) => setEventTypeName(e.target.value)}
                placeholder="e.g., button_clicked"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={eventTypeDescription}
                onChange={(e) => setEventTypeDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsCreateEventTypeModalOpen(false);
                  setCreateEventTypeStepIndex(null);
                }}
                className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingEventType || !eventTypeName.trim()}
                className="px-6 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCreatingEventType ? 'Creating...' : 'Create Event Type'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      {createPortal(modalContent, document.body)}
      {createEventTypeModal}
    </>
  );
}
