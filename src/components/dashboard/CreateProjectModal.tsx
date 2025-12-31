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
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Validation constants
  const MIN_NAME_LENGTH = 3;
  const MAX_NAME_LENGTH = 100;
  const MIN_SLUG_LENGTH = 3;
  const MAX_SLUG_LENGTH = 50;

  // Validate project name
  const validateName = (value: string): string => {
    const trimmed = value.trim();
    
    if (trimmed.length === 0) {
      return 'Project name is required';
    }
    
    if (trimmed.length < MIN_NAME_LENGTH) {
      return `Project name must be at least ${MIN_NAME_LENGTH} characters`;
    }
    
    if (trimmed.length > MAX_NAME_LENGTH) {
      return `Project name must be no more than ${MAX_NAME_LENGTH} characters`;
    }
    
    // Allow letters, numbers, spaces, hyphens, underscores, and common punctuation
    const validPattern = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
    if (!validPattern.test(trimmed)) {
      return 'Project name contains invalid characters. Use letters, numbers, spaces, hyphens, underscores, and basic punctuation only.';
    }
    
    // Check for consecutive spaces
    if (/\s{2,}/.test(trimmed)) {
      return 'Project name cannot contain consecutive spaces';
    }
    
    // Check if it starts or ends with space
    if (value !== trimmed) {
      return 'Project name cannot start or end with spaces';
    }
    
    return '';
  };

  // Validate slug
  const validateSlug = (value: string): string => {
    const trimmed = value.trim();
    
    if (trimmed.length === 0) {
      return 'Project slug is required';
    }
    
    if (trimmed.length < MIN_SLUG_LENGTH) {
      return `Project slug must be at least ${MIN_SLUG_LENGTH} characters`;
    }
    
    if (trimmed.length > MAX_SLUG_LENGTH) {
      return `Project slug must be no more than ${MAX_SLUG_LENGTH} characters`;
    }
    
    // Must match pattern: lowercase letters, numbers, hyphens only
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(trimmed)) {
      return 'Slug must contain only lowercase letters, numbers, and hyphens';
    }
    
    // Cannot start or end with hyphen
    if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
      return 'Slug cannot start or end with a hyphen';
    }
    
    // Cannot have consecutive hyphens
    if (trimmed.includes('--')) {
      return 'Slug cannot contain consecutive hyphens';
    }
    
    return '';
  };

  // Generate slug from name
  const generateSlugFromName = (nameValue: string): string => {
    return nameValue
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const error = validateName(value);
    setNameError(error);
    
    // Always auto-generate slug unless user has manually edited it
    if (!isSlugManuallyEdited) {
      const generatedSlug = generateSlugFromName(value);
      setSlug(generatedSlug);
      if (generatedSlug) {
        const slugErr = validateSlug(generatedSlug);
        setSlugError(slugErr);
      } else {
        setSlugError('');
      }
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setIsSlugManuallyEdited(true); // Mark as manually edited
    const error = validateSlug(value);
    setSlugError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submit
    const nameErr = validateName(name);
    const slugErr = validateSlug(slug);
    
    setNameError(nameErr);
    setSlugError(slugErr);
    
    if (nameErr || slugErr) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    if (!name.trim() || !slug.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const project = await createProject(name, slug, description);
      toast.success('Project created successfully!');
      setName('');
      setSlug('');
      setDescription('');
      setNameError('');
      setSlugError('');
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
      setSlug('');
      setDescription('');
      setNameError('');
      setSlugError('');
      setIsSlugManuallyEdited(false);
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
              minLength={MIN_NAME_LENGTH}
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
                {name.length > 0 ? `${name.length}/${MAX_NAME_LENGTH} characters` : `Between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
              Project Slug <span className="text-red-400">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              minLength={MIN_SLUG_LENGTH}
              maxLength={MAX_SLUG_LENGTH}
              pattern="[a-z0-9-]+"
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 transition-all cursor-text font-mono text-sm ${
                slugError
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-white/20'
              }`}
              placeholder="my-awesome-project"
            />
            {slugError ? (
              <p className="mt-1 text-xs text-red-400">{slugError}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                {slug.length > 0 ? `${slug.length}/${MAX_SLUG_LENGTH} characters` : `Lowercase letters, numbers, and hyphens only (${MIN_SLUG_LENGTH}-${MAX_SLUG_LENGTH} characters)`}
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
              disabled={isLoading || !name.trim() || !slug.trim() || !!nameError || !!slugError}
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

