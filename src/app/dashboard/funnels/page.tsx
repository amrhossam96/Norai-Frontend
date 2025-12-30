'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ChevronRight, BarChart3 } from 'lucide-react';
import { getFunnels, getFunnelDetails } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';

export default function FunnelsPage() {
  const { selectedProjectId } = useDashboard();
  const [funnels, setFunnels] = useState<any[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [funnelDetails, setFunnelDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadFunnels = async () => {
      if (!selectedProjectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getFunnels(selectedProjectId, {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        // Handle both wrapped and unwrapped responses
        let funnelsData: any[] = [];

        if (Array.isArray(response)) {
          funnelsData = response;
        } else if (response && typeof response === 'object') {
          // Try different possible response structures
          funnelsData = response.data || response.funnels || response.results || [];
        }

        // Ensure funnelsData is always an array
        if (!Array.isArray(funnelsData)) {
          funnelsData = [];
        }

        setFunnels(funnelsData);
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
        setIsLoadingDetails(true);
        const details = await getFunnelDetails(
          selectedProjectId,
          selectedFunnel,
          startDate || undefined,
          endDate || undefined
        );
        setFunnelDetails(details.details || details);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load funnel details');
        setFunnelDetails(null);
      } finally {
        setIsLoadingDetails(false);
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
      <div>
        <h1 className="text-3xl font-bold mb-2">Funnels</h1>
        <p className="text-gray-400">Create and analyze conversion funnels</p>
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
            <h2 className="text-lg font-semibold mb-4">Funnels ({funnels.length})</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading funnels...</div>
              </div>
            ) : !Array.isArray(funnels) || funnels.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                <p className="text-sm text-gray-400 mb-2">No funnels found</p>
                <p className="text-xs text-gray-500">Create a funnel to get started</p>
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
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 mb-2">Select a funnel to view details</p>
                <p className="text-sm text-gray-500">See conversion rates and drop-off points</p>
              </div>
            ) : isLoadingDetails ? (
              <div className="text-center py-12">
                <div className="text-gray-400">Loading funnel details...</div>
              </div>
            ) : funnelDetails ? (
              <div className="space-y-6">
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
                      {calculateConversionRate(
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
                        const previousCount = index === 0 
                          ? funnelDetails.started 
                          : funnelDetails.steps[index - 1].count;
                        const currentCount = step.count || 0;
                        const dropOff = previousCount - currentCount;
                        const conversionRate = previousCount > 0 
                          ? ((currentCount / previousCount) * 100).toFixed(1)
                          : '0';

                        return (
                          <div key={step.step_id || index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium">{step.event_type || step.name}</div>
                                  {step.description && (
                                    <div className="text-xs text-gray-500">{step.description}</div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">{currentCount.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">{conversionRate}%</div>
                              </div>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2 ml-11">
                              <div
                                className="bg-white h-2 rounded-full transition-all"
                                style={{
                                  width: `${previousCount > 0 ? (currentCount / previousCount) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            {dropOff > 0 && index < funnelDetails.steps.length - 1 && (
                              <div className="text-xs text-gray-500 ml-11">
                                {dropOff.toLocaleString()} users dropped off
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
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">No details available for this funnel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
