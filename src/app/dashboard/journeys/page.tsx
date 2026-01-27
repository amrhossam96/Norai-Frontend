'use client';

import { useState, useEffect } from 'react';
import { Map, Calendar, TrendingDown, AlertCircle, Users, Clock } from 'lucide-react';
import { getJourneyDropOffAnalysis, JourneyDropOffAnalysis } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';

export default function JourneysPage() {
  const { selectedProjectId } = useDashboard();
  const [analysis, setAnalysis] = useState<JourneyDropOffAnalysis | null>(null);
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
          endDate,
          10 // limit
        );
        setAnalysis(response);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load journey analysis');
        setAnalysis(null);
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

      {/* Overview Stats */}
      {analysis && analysis.total_users_analyzed > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Users Analyzed</span>
            </div>
            <div className="text-2xl font-bold">{analysis.total_users_analyzed.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Avg Journey Length</span>
            </div>
            <div className="text-2xl font-bold">{analysis.average_journey_length.toFixed(1)} events</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center gap-3 mb-2">
              <Map className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Median Journey</span>
            </div>
            <div className="text-2xl font-bold">{analysis.median_journey_length} events</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Avg Time to Drop-off</span>
            </div>
            <div className="text-2xl font-bold">
              {analysis.average_time_to_drop_off > 3600 
                ? `${(analysis.average_time_to_drop_off / 3600).toFixed(1)}h`
                : analysis.average_time_to_drop_off > 60
                  ? `${(analysis.average_time_to_drop_off / 60).toFixed(1)}m`
                  : `${analysis.average_time_to_drop_off.toFixed(0)}s`
              }
            </div>
          </div>
        </div>
      )}

      {/* Drop-off by Event Type */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingDown className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Drop-off by Event Type</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading analysis...</div>
          </div>
        ) : !analysis || !analysis.drop_off_by_event_type || analysis.drop_off_by_event_type.length === 0 ? (
          <div className="text-center py-12">
            <Map className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-2">No drop-off data available</p>
            <p className="text-sm text-gray-500">
              Drop-off analysis requires tracked events. Start tracking events with the SDK to see where users drop off.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {analysis.drop_off_by_event_type.map((dropOff, index) => {
              const dropOffRate = (dropOff.drop_off_rate * 100).toFixed(1);

              return (
                <div
                  key={dropOff.event_type || index}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{dropOff.event_type}</div>
                        {dropOff.average_time_after > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            Avg time to next event: {dropOff.average_time_after > 60 
                              ? `${(dropOff.average_time_after / 60).toFixed(1)}m`
                              : `${dropOff.average_time_after.toFixed(0)}s`
                            }
                          </div>
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
                      <div className="text-xs text-gray-500 mb-1">Users Reached</div>
                      <div className="text-lg font-semibold">
                        {dropOff.users_reached.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Dropped Off</div>
                      <div className="text-lg font-semibold text-red-400">
                        {dropOff.users_dropped_off.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Continued</div>
                      <div className="text-lg font-semibold text-green-400">
                        {dropOff.users_continued.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-red-400 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(100, parseFloat(dropOffRate))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Common Last Events */}
      {analysis && analysis.common_last_events && analysis.common_last_events.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Common Exit Points</h2>
            <span className="text-sm text-gray-500">Where users most commonly end their journey</span>
          </div>

          <div className="space-y-3">
            {analysis.common_last_events.map((lastEvent, index) => (
              <div
                key={lastEvent.event_type || index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{lastEvent.event_type}</div>
                    <div className="text-xs text-gray-500">
                      Avg position: step {lastEvent.average_position.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{lastEvent.count.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{(lastEvent.percentage * 100).toFixed(1)}% of users</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
