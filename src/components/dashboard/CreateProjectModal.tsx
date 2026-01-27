'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createProject } from '@/lib/api-client';
import { toast } from 'sonner';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId?: string) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  // Validation constants
  const MIN_NAME_LENGTH = 1;
  const MAX_NAME_LENGTH = 100;

  // Validate project name
  const validateName = (value: string): string => {
    const trimmed = value.trim();
    
    if (trimmed.length === 0) {
      return 'Project name is required';
    }
    
    if (trimmed.length < MIN_NAME_LENGTH) {
      return `Project name must be at least ${MIN_NAME_LENGTH} character`;
    }
    
    if (trimmed.length > MAX_NAME_LENGTH) {
      return `Project name must be no more than ${MAX_NAME_LENGTH} characters`;
    }
    
    return '';
  };

  const handleNameChange = (value: string) => {
    setName(value);
    const error = validateName(value);
    setNameError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submit
    const nameErr = validateName(name);
    setNameError(nameErr);
    
    if (nameErr) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsLoading(true);

    try {
      const project = await createProject(name.trim(), description.trim() || undefined);
      toast.success('Project created successfully!');
      setName('');
      setDescription('');
      setNameError('');
      onSuccess(project.id);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setNameError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-md backdrop-blur-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Create New Project</h2>
          <p className="text-gray-400 text-sm">Get started by creating your first project</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              maxLength={MAX_NAME_LENGTH}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 transition-all cursor-text ${
                nameError
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-white/20'
              }`}
              placeholder="My Awesome Project"
            />
            {nameError ? (
              <p className="mt-1 text-xs text-red-400">{nameError}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                {name.length > 0 ? `${name.length}/${MAX_NAME_LENGTH} characters` : `Up to ${MAX_NAME_LENGTH} characters`}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text resize-none"
              placeholder="Describe your project..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !!nameError}
              className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
