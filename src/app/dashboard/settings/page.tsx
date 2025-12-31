'use client';

import { useState, useEffect, useRef } from 'react';
import { Key, Plus, Trash2, Copy, Check, AlertCircle, FolderOpen, Edit2, Archive, ArchiveRestore, X, Loader2 } from 'lucide-react';
import { 
  getAPIKeys, 
  revokeAPIKey, 
  APIKey,
  getProjects,
  getProjectOverview,
  updateProject,
  archiveProject,
  unarchiveProject,
  deleteProject,
  Project
} from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import CreateAPIKeyModal from '@/components/dashboard/CreateAPIKeyModal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { createPortal } from 'react-dom';

export default function SettingsPage() {
  const { selectedProjectId, setSelectedProjectId } = useDashboard();
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  
  // Project management state
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const isDeletingRef = useRef(false); // Track deletion in progress to prevent flickering
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'default' | 'danger' | 'warning';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    projectName: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    projectName: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    // Skip if we're in the middle of deleting to prevent flickering
    if (isDeletingRef.current) return;
    
    const loadAPIKeys = async () => {
      if (!selectedProjectId) {
        setAPIKeys([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  // Load current project details
  const loadCurrentProject = async () => {
    if (!selectedProjectId) {
      // Immediately clear state without loading
      setCurrentProject(null);
      setIsLoadingProject(false);
      return;
    }

    try {
      setIsLoadingProject(true);
      const projects = await getProjects(true); // Include archived
      const project = projects.find(p => p.id === selectedProjectId);
      
      // If project not found, clear project but don't change selectedProjectId here
      // (let the parent handle that to avoid flickering)
      if (!project) {
        setCurrentProject(null);
        setIsLoadingProject(false);
        return;
      }
      
      setCurrentProject(project);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load project details');
      setCurrentProject(null);
    } finally {
      setIsLoadingProject(false);
    }
  };

  useEffect(() => {
    // Skip if we're in the middle of deleting to prevent flickering
    if (isDeletingRef.current) return;
    
    loadCurrentProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  // Load all projects for management
  const loadAllProjects = async () => {
    try {
      const projects = await getProjects(true); // Include archived
      setAllProjects(projects);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load projects');
      setAllProjects([]);
    }
  };

  useEffect(() => {
    loadAllProjects();
  }, []);

  const handleRevoke = async (keyId: string) => {
    if (!selectedProjectId) return;

    const key = apiKeys.find(k => k.id === keyId);
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke API Key',
      message: `Are you sure you want to revoke "${key?.name || 'this API key'}"? This action cannot be undone.`,
      confirmText: 'Revoke',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setRevokingId(keyId);
          await revokeAPIKey(selectedProjectId, keyId);
          toast.success('API key revoked successfully');
          // Reload keys
          const keys = await getAPIKeys(selectedProjectId);
          setAPIKeys(keys);
          setConfirmDialog({ 
            isOpen: false,
            title: '',
            message: '',
            onConfirm: () => {},
          });
        } catch (error: any) {
          toast.error(error.message || 'Failed to revoke API key');
        } finally {
          setRevokingId(null);
        }
      },
    });
  };

  const handleKeyCreated = () => {
    // Reload keys after creation
    if (selectedProjectId) {
      getAPIKeys(selectedProjectId).then(setAPIKeys).catch(() => {});
    }
  };

  // Project management handlers
  const handleArchive = async () => {
    if (!selectedProjectId || !currentProject) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Project',
      message: `Are you sure you want to archive "${currentProject.name}"? You can unarchive it later.`,
      confirmText: 'Archive',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setIsArchiving(true);
          await archiveProject(selectedProjectId);
          toast.success('Project archived successfully');
          await loadAllProjects();
          // If project was archived, switch to first active project
          const updatedProjects = await getProjects(false); // Get active projects
          if (updatedProjects.length > 0) {
            setSelectedProjectId(updatedProjects[0].id);
          } else {
            setSelectedProjectId(null);
          }
          await loadCurrentProject();
          setConfirmDialog({ 
            isOpen: false,
            title: '',
            message: '',
            onConfirm: () => {},
          });
        } catch (error: any) {
          toast.error(error.message || 'Failed to archive project');
        } finally {
          setIsArchiving(false);
        }
      },
    });
  };

  const handleUnarchive = async () => {
    if (!selectedProjectId || !currentProject) return;

    try {
      setIsArchiving(true);
      await unarchiveProject(selectedProjectId);
      toast.success('Project unarchived successfully');
      await loadCurrentProject();
      await loadAllProjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unarchive project');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProjectId || !currentProject) return;
    
    const projectName = currentProject.name;
    
    // Show delete confirmation dialog that requires typing the project name
    setDeleteDialog({
      isOpen: true,
      projectName: projectName,
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          isDeletingRef.current = true; // Set flag to prevent useEffects from firing
          
          await deleteProject(selectedProjectId);
          toast.success('Project deleted successfully');
          
          // Get updated projects first
          const updatedProjects = await getProjects(false);
          
          // Batch all state updates together to prevent flickering
          if (updatedProjects.length > 0) {
            // Switch to first active project - batch all updates
            const newProjectId = updatedProjects[0].id;
            // Clear old data first, then set new project
            setCurrentProject(null);
            setAPIKeys([]);
            setIsLoadingProject(true);
            setSelectedProjectId(newProjectId);
            
            // Allow useEffects to run after a brief delay to ensure state is batched
            // This prevents flickering by letting React batch all updates first
            requestAnimationFrame(() => {
              isDeletingRef.current = false;
            });
          } else {
            // No projects left - clear everything in one batch
            setSelectedProjectId(null);
            setCurrentProject(null);
            setAPIKeys([]);
            setIsLoadingProject(false);
            
            // Allow useEffects to run after state is cleared
            requestAnimationFrame(() => {
              isDeletingRef.current = false;
            });
          }
          
          // Reload all projects list
          await loadAllProjects();
          
          // Force a small delay to ensure ProjectSelector refreshes
          // This gives React time to process the state updates
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Close dialog
          setDeleteDialog({
            isOpen: false,
            projectName: '',
            onConfirm: () => {},
          });
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete project');
          isDeletingRef.current = false; // Reset flag on error
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  if (!selectedProjectId) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and project settings</p>
        </div>

        {/* No Project Selected State */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
          <p className="text-gray-400 mb-2">No project selected</p>
          <p className="text-sm text-gray-500">Please select a project from the dropdown above to manage settings</p>
        </div>
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

      {/* Project Settings Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Project Settings</h2>
            <p className="text-sm text-gray-400">
              Manage your current project and view all projects
            </p>
          </div>
        </div>

        {isLoadingProject ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading project details...</div>
          </div>
        ) : !currentProject ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-2">No project selected</p>
            <p className="text-sm text-gray-500">Select a project from the dropdown above</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Project Info */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderOpen className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-lg">{currentProject.name}</span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        currentProject.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : currentProject.status === 'archived'
                          ? 'bg-white/10 text-gray-400 border border-white/20'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {currentProject.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>Slug: <span className="font-mono text-xs">{currentProject.slug}</span></div>
                    {currentProject.description && (
                      <div>Description: {currentProject.description}</div>
                    )}
                    <div>Created: {new Date(currentProject.created_at).toLocaleDateString()}</div>
                    <div>Last updated: {new Date(currentProject.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                  title="Edit project"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                {currentProject.status === 'archived' ? (
                  <button
                    onClick={handleUnarchive}
                    disabled={isArchiving}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    {isArchiving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Unarchiving...
                      </>
                    ) : (
                      <>
                        <ArchiveRestore className="w-4 h-4" />
                        Unarchive Project
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleArchive}
                    disabled={isArchiving}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    {isArchiving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        Archive Project
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* All Projects List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">All Projects</h3>
                <button
                  onClick={() => {
                    setShowArchived(!showArchived);
                    loadAllProjects();
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allProjects
                  .filter(p => showArchived || p.status === 'active')
                  .map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer ${
                        project.id === selectedProjectId ? 'bg-white/10 border-white/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            project.status === 'active' ? 'bg-green-400' : 
                            project.status === 'archived' ? 'bg-gray-400' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-xs text-gray-500">{project.slug}</div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            project.status === 'active'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : project.status === 'archived'
                              ? 'bg-white/10 text-gray-400 border border-white/20'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
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

      {/* Edit Project Modal */}
      {isEditModalOpen && currentProject && typeof window !== 'undefined' && createPortal(
        <EditProjectModal
          project={currentProject}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={async () => {
            await loadCurrentProject();
            await loadAllProjects();
          }}
        />,
        document.body
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant || 'default'}
        isLoading={isArchiving || revokingId !== null}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
        onConfirm={deleteDialog.onConfirm}
        title="Delete Project"
        message={`This action cannot be undone. This will permanently delete the project "${deleteDialog.projectName}" and all of its data.`}
        confirmText="Delete Forever"
        cancelText="Cancel"
        itemName={deleteDialog.projectName}
        isLoading={isDeleting}
      />
    </div>
  );
}

// Edit Project Modal Component
function EditProjectModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [slug, setSlug] = useState(project.slug);
  const [description, setDescription] = useState(project.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [slugError, setSlugError] = useState('');

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

  const handleNameChange = (value: string) => {
    setName(value);
    const error = validateName(value);
    setNameError(error);
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    const error = validateSlug(value);
    setSlugError(error);
  };

  // Reset errors when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(project.name);
      setSlug(project.slug);
      setDescription(project.description || '');
      setNameError('');
      setSlugError('');
    }
  }, [isOpen, project]);

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
      await updateProject(project.id, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Project updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-black border border-white/10 rounded-[24px] p-8 w-full max-w-md backdrop-blur-xl z-[10001]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Edit Project</h2>
          <p className="text-gray-400 text-sm">Update your project details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-2">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              id="edit-name"
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
            <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-300 mb-2">
              Project Slug <span className="text-red-400">*</span>
            </label>
            <input
              id="edit-slug"
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
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text resize-none"
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
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
