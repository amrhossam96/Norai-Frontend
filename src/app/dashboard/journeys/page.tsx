'use client';

import { useState, useEffect } from 'react';
import { Map, Calendar, TrendingDown, AlertCircle } from 'lucide-react';
import { getJourneyDropOffAnalysis } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';

export default function JourneysPage() {
  const { selectedProjectId } = useDashboard();
  const [dropOffAnalysis, setDropOffAnalysis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default to last 30 days (ending yesterday to avoid future date issues)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [startDate, setStartDate] = useState(
    thirtyDaysAgo.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    yesterday.toISOString().split('T')[0]
  );

  useEffect(() => {
    const loadDropOffAnalysis = async () => {
      if (!selectedProjectId || !startDate || !endDate) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await getJourneyDropOffAnalysis(
          selectedProjectId,
          startDate,
          endDate
        );

        // Handle both wrapped and unwrapped responses
        let analysisData: any[] = [];

        if (Array.isArray(response)) {
          analysisData = response;
        } else if (response && typeof response === 'object') {
          // Try different possible response structures
          analysisData = response.data || response.analysis || response.drop_offs || [];
        }

        // Ensure analysisData is always an array
        if (!Array.isArray(analysisData)) {
          analysisData = [];
        }

        setDropOffAnalysis(analysisData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load journey analysis');
        setDropOffAnalysis([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDropOffAnalysis();
  }, [selectedProjectId, startDate, endDate]);

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to view journey analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Journeys</h1>
        <p className="text-gray-400">Analyze user journeys and drop-off points</p>
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
            max={yesterday.toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Drop-off Analysis */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingDown className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Drop-off Analysis</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading analysis...</div>
          </div>
        ) : !Array.isArray(dropOffAnalysis) || dropOffAnalysis.length === 0 ? (
          <div className="text-center py-12">
            <Map className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-2">No drop-off data available</p>
            <p className="text-sm text-gray-500">
              Drop-off analysis will appear here once you have sufficient journey data
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(dropOffAnalysis) && dropOffAnalysis.map((dropOff, index) => {
              const dropOffRate = dropOff.total_users > 0
                ? ((dropOff.drop_off_count / dropOff.total_users) * 100).toFixed(1)
                : '0';

              return (
                <div
                  key={dropOff.event_type || dropOff.step_id || index}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {dropOff.event_type || dropOff.step_name || `Step ${index + 1}`}
                        </div>
                        {dropOff.description && (
                          <div className="text-sm text-gray-500 mt-1">{dropOff.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400">{dropOffRate}%</div>
                      <div className="text-xs text-gray-500">Drop-off Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Users</div>
                      <div className="text-lg font-semibold">
                        {dropOff.total_users?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Dropped Off</div>
                      <div className="text-lg font-semibold text-red-400">
                        {dropOff.drop_off_count?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Continued</div>
                      <div className="text-lg font-semibold text-green-400">
                        {((dropOff.total_users || 0) - (dropOff.drop_off_count || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-white/5 rounded-full h-3">
                      <div
                        className="bg-red-400 h-3 rounded-full transition-all"
                        style={{
                          width: `${dropOffRate}%`,
                        }}
                      />
                    </div>
                  </div>

                  {dropOff.recommendations && dropOff.recommendations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs text-gray-500 mb-2">Recommendations</div>
                      <ul className="space-y-1">
                        {dropOff.recommendations.map((rec: string, recIndex: number) => (
                          <li key={recIndex} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-gray-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
