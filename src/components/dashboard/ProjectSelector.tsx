'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { getProjects } from '@/lib/api-client';
import { toast } from 'sonner';
import CreateProjectModal from './CreateProjectModal';

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function ProjectSelector({ 
  selectedProjectId, 
  onProjectChange 
}: { 
  selectedProjectId: string | null;
  onProjectChange: (projectId: string) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      
      // Ensure data is an array
      const projectsArray = Array.isArray(data) ? data : [];
      setProjects(projectsArray);
      
      // Auto-select first project if none selected
      if (projectsArray.length > 0 && !selectedProjectId) {
        onProjectChange(projectsArray[0].id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load projects');
      setProjects([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const selectedProject = Array.isArray(projects) ? projects.find(p => p.id === selectedProjectId) : undefined;

  const handleProjectSelect = (projectId: string) => {
    onProjectChange(projectId);
    setIsOpen(false);
  };

  const handleProjectCreated = async (newProjectId?: string) => {
    await loadProjects();
    // Auto-select the newly created project if ID is provided
    if (newProjectId) {
      onProjectChange(newProjectId);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
        <div className="text-sm text-gray-400">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <>
        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-center">
          <p className="text-sm text-gray-400 mb-3">No projects yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium cursor-pointer flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleProjectCreated}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="font-medium">
              {selectedProject?.name || 'Select Project'}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/10 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
              <div className="p-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={`
                      w-full px-4 py-3 rounded-lg text-left transition-all cursor-pointer
                      ${
                        selectedProjectId === project.id
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="font-medium">{project.name}</div>
                    {project.description && (
                      <div className="text-xs text-gray-500 mt-1">{project.description}</div>
                    )}
                  </button>
                ))}
                <div className="border-t border-white/10 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="w-full px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Create New Project</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </>
  );
}

