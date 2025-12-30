'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardContextType {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  selectedProjectId: null,
  setSelectedProjectId: () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <DashboardContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);

