'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ChevronRight, BarChart3, Plus } from 'lucide-react';
import { getFunnels, getFunnelAnalytics } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';
import CreateFunnelModal from '@/components/dashboard/CreateFunnelModal';

export default function FunnelsPage() {
  const { selectedProjectId } = useDashboard();
  const [funnels, setFunnels] = useState<any[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [funnelDetails, setFunnelDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const loadFunnels = async () => {
      if (!selectedProjectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const funnelsData = await getFunnels(selectedProjectId);
        setFunnels(Array.isArray(funnelsData) ? funnelsData : []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load funnels');
        setFunnels([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFunnels();
  }, [selectedProjectId, startDate, endDate]);

  useEffect(() => {
    const loadFunnelDetails = async () => {
      if (!selectedProjectId || !selectedFunnel) {
        setFunnelDetails(null);
        return;
      }

      try {
        const analytics = await getFunnelAnalytics(
          selectedProjectId,
          selectedFunnel,
          startDate || undefined,
          endDate || undefined
        );
        setFunnelDetails(analytics);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load funnel analytics');
        setFunnelDetails(null);
      }
    };

    loadFunnelDetails();
  }, [selectedProjectId, selectedFunnel, startDate, endDate]);

  const calculateConversionRate = (entered: number, completed: number) => {
    if (entered === 0) return 0;
    return ((completed / entered) * 100).toFixed(2);
  };

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to view funnels.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Funnels</h1>
          <p className="text-gray-400">Create and analyze conversion funnels</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-all font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create Funnel
        </button>
      </div>

      {/* Date Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center gap-4 mb-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Date Range</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnels List */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Funnels ({funnels.length})</h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                title="Create Funnel"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading funnels...</div>
              </div>
            ) : !Array.isArray(funnels) || funnels.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                <p className="text-sm text-gray-400 mb-2">No funnels found</p>
                <p className="text-xs text-gray-500 mb-4">Create a funnel to get started</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Funnel
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {Array.isArray(funnels) && funnels.map((funnel, index) => (
                  <div
                    key={funnel.id || funnel.funnel_id || index}
                    onClick={() => setSelectedFunnel(funnel.id || funnel.funnel_id)}
                    className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer ${
                      selectedFunnel === (funnel.id || funnel.funnel_id)
                        ? 'bg-white/10 border-white/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{funnel.name || `Funnel ${index + 1}`}</div>
                        {funnel.description && (
                          <div className="text-xs text-gray-500 mt-1">{funnel.description}</div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Funnel Details */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <h2 className="text-lg font-semibold mb-6">Funnel Details</h2>
            {!selectedFunnel ? (
              <div className="text-center py-12 animate-in fade-in duration-300">
                <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 mb-2">Select a funnel to view details</p>
                <p className="text-sm text-gray-500">See conversion rates and drop-off points</p>
              </div>
            ) : (
              <div className="relative min-h-[400px]">
                {/* Content */}
                {funnelDetails ? (
                  <div 
                    key={selectedFunnel} 
                    className="space-y-6"
                  >
                    {/* Overall Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="text-xs text-gray-500 mb-1">Started</div>
                        <div className="text-2xl font-bold">
                          {funnelDetails.started?.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="text-xs text-gray-500 mb-1">Completed</div>
                        <div className="text-2xl font-bold">
                          {funnelDetails.completed?.toLocaleString() || '0'}
                        </div>
                      </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-xs text-gray-500 mb-1">Conversion Rate</div>
                    <div className="text-2xl font-bold">
                      {funnelDetails.conversion !== undefined
                        ? (funnelDetails.conversion * 100).toFixed(2)
                        : calculateConversionRate(
                            funnelDetails.started || 0,
                            funnelDetails.completed || 0
                          )}%
                    </div>
                  </div>
                    </div>

                    {/* Steps */}
                    {funnelDetails.steps && funnelDetails.steps.length > 0 && (
                      <div>
                        <h3 className="text-md font-semibold mb-4">Funnel Steps</h3>
                        <div className="space-y-4">
                          {funnelDetails.steps.map((step: any, index: number) => {
                            const currentCount = step.users || 0;
                            const startedCount = funnelDetails.started || 0;
                            const previousCount = index === 0 
                              ? startedCount
                              : (funnelDetails.steps[index - 1].users || 0);
                            const dropOff = step.drop_off !== undefined 
                              ? step.drop_off 
                              : Math.max(0, previousCount - currentCount);
                            
                            // Backend provides display_percentage - just format it
                            const stepConversionRate = step.display_percentage !== undefined
                              ? (step.display_percentage * 100).toFixed(1)
                              : '0';
                            
                            // Progress bar width relative to first step (clamped 0-100%)
                            const progressWidth = Math.min(100, Math.max(0, 
                              startedCount > 0 ? (currentCount / startedCount) * 100 : 0
                            ));

                            return (
                              <div key={step.order || step.step_id || index} className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                      {step.order || index + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-medium truncate">{step.event_type || step.name}</div>
                                      {step.description && (
                                        <div className="text-xs text-gray-500 truncate">{step.description}</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="font-bold">{currentCount.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">{stepConversionRate}%</div>
                                  </div>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-white h-2 rounded-full transition-all"
                                    style={{ width: `${progressWidth}%` }}
                                  />
                                </div>
                                {dropOff > 0 && index < funnelDetails.steps.length - 1 && (
                                  <div className="text-xs text-gray-500">
                                    ↓ {dropOff.toLocaleString()} users dropped off
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 animate-in fade-in duration-300">
                    <p className="text-sm text-gray-400">No details available for this funnel</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Funnel Modal */}
      <CreateFunnelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Reload funnels list
          const loadFunnels = async () => {
            if (!selectedProjectId) return;
            try {
              const funnelsData = await getFunnels(selectedProjectId);
              setFunnels(Array.isArray(funnelsData) ? funnelsData : []);
            } catch (error: any) {
              toast.error(error.message || 'Failed to reload funnels');
            }
          };
          loadFunnels();
        }}
      />
    </div>
  );
}
