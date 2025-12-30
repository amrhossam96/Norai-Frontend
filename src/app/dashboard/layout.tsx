'use client';

import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProjectSelector from '@/components/dashboard/ProjectSelector';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { selectedProjectId, setSelectedProjectId } = useDashboard();

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardSidebar />
      <main className="ml-0 lg:ml-64 transition-all duration-300">
        <div className="p-4 lg:p-6">
          {/* Project Selector */}
          <div className="mb-6">
            <ProjectSelector
              selectedProjectId={selectedProjectId}
              onProjectChange={setSelectedProjectId}
            />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

