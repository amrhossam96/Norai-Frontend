'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getTimeSeries, getComparison, TimeSeriesResponse, ComparisonResponse } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import Select from '@/components/ui/select';
import DatePicker from '@/components/ui/date-picker';

export default function AnalyticsPage() {
  const { selectedProjectId } = useDashboard();
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default to last 30 days (ending 2 days ago to avoid future date issues)
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [startDate, setStartDate] = useState(
    thirtyDaysAgo.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    twoDaysAgo.toISOString().split('T')[0]
  );
  
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [metric, setMetric] = useState<'events' | 'sessions' | 'active_users'>('events');
  const [comparisonType, setComparisonType] = useState<'wow' | 'mom'>('wow');

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedProjectId || !startDate || !endDate) {
        return;
      }

      // Validate dates are not in the future
      const todayString = new Date().toISOString().split('T')[0];
      if (endDate > todayString) {
        // Silently skip if end date is in the future (user hasn't selected dates yet)
        return;
      }

      try {
        setIsLoading(true);
        
        // Load time series data
        const timeSeries = await getTimeSeries(
          selectedProjectId,
          period,
          metric,
          startDate,
          endDate
        );
        // Response structure: { period, metric, data_points: [], total }
        setTimeSeriesData(timeSeries);

        // Load comparison data
        const comparison = await getComparison(
          selectedProjectId,
          comparisonType,
          metric,
          startDate,
          endDate
        );
        // Response structure: { current_value, previous_value, change, change_type, ... }
        setComparisonData(comparison);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load analytics';
        // Only show error if it's not a date validation error (suppress "future date" errors)
        if (!errorMessage.toLowerCase().includes('future')) {
          toast.error(errorMessage);
        }
        setTimeSeriesData(null);
        setComparisonData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedProjectId, startDate, endDate, period, metric, comparisonType]);

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to view analytics.</p>
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-400">Deep dive into your analytics and metrics</p>
      </div>

      {/* Controls */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            max={new Date().toISOString().split('T')[0]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
            <Select
              value={period}
              onChange={(value) => setPeriod(value as 'day' | 'week' | 'month')}
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Metric</label>
            <Select
              value={metric}
              onChange={(value) => setMetric(value as 'events' | 'sessions' | 'active_users')}
              options={[
                { value: 'events', label: 'Events' },
                { value: 'sessions', label: 'Sessions' },
                { value: 'active_users', label: 'Active Users' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Comparison</label>
            <Select
              value={comparisonType}
              onChange={(value) => setComparisonType(value as 'wow' | 'mom')}
              options={[
                { value: 'wow', label: 'Week over Week' },
                { value: 'mom', label: 'Month over Month' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Comparison Stats */}
      {comparisonData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <Activity className="w-5 h-5 text-white" />
              </div>
              {comparisonData.change !== undefined && (
                <div className={`flex items-center gap-1 ${
                  comparisonData.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {comparisonData.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {comparisonData.change >= 0 ? '+' : ''}{comparisonData.change.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">
                {comparisonData.current_value?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-400">Current Period</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">
                {comparisonData.previous_value?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-400">Previous Period</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">
                {((comparisonData.current_value || 0) - (comparisonData.previous_value || 0)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">Difference</p>
            </div>
          </div>
        </div>
      )}

      {/* Time Series Chart */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Time Series</h2>
          {timeSeriesData && (
            <div className="text-sm text-gray-400">
              Total: <span className="font-semibold text-white">{timeSeriesData.total?.toLocaleString() || '0'}</span>
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading chart data...</div>
          </div>
        ) : timeSeriesData && Array.isArray(timeSeriesData.data_points) && timeSeriesData.data_points.length > 0 ? (
          <div className="space-y-6">
            {/* Scrollable bar chart (original style, but constrained to card width) */}
            <div className="overflow-x-auto -mx-6 px-6">
              {(() => {
                const points = timeSeriesData.data_points;
                const maxValue = Math.max(...points.map((p: any) => p.value || 0)) || 1;
                const innerWidth = Math.max(600, points.length * 40);

                return (
                  <div
                    className="h-64 flex items-end gap-2"
                    style={{ width: innerWidth }}
                  >
                    {points.map((point: any, index: number) => {
                      const heightPercent = ((point.value || 0) / maxValue) * 100;
                      return (
                        <div
                          key={point.date || index}
                          className="flex-1 min-w-[32px] flex flex-col items-center justify-end"
                        >
                          <div
                            className="w-full bg-white rounded-t-md transition-all hover:bg-gray-200 cursor-pointer shadow-sm"
                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                            title={`${point.date ? new Date(point.date).toLocaleDateString() : 'N/A'}: ${point.value?.toLocaleString() || 0}`}
                          />
                          <div className="mt-2 text-[10px] text-gray-500 text-center whitespace-nowrap">
                            {point.date
                              ? new Date(point.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Data points summary */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold mb-4 text-gray-400">Recent Data Points</h3>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 min-w-max">
                  {timeSeriesData.data_points.slice(0, 16).map((point: any, index: number) => (
                    <div key={index} className="text-center min-w-[80px]">
                      <div className="text-sm font-semibold">{formatValue(point.value || 0)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {point.date
                          ? new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-2">No time series data available</p>
            <p className="text-sm text-gray-500">Select a date range and metric to view analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
