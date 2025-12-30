'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getTimeSeries, getComparison } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import Select from '@/components/ui/select';
import DatePicker from '@/components/ui/date-picker';

export default function AnalyticsPage() {
  const { selectedProjectId } = useDashboard();
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [startDate, setStartDate] = useState(
    thirtyDaysAgo.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    today.toISOString().split('T')[0]
  );
  
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [metric, setMetric] = useState<'events' | 'sessions' | 'active_users'>('events');
  const [comparisonType, setComparisonType] = useState<'wow' | 'mom'>('wow');

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedProjectId || !startDate || !endDate) {
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
        setTimeSeriesData(timeSeries.time_series || timeSeries);

        // Load comparison data
        const comparison = await getComparison(
          selectedProjectId,
          comparisonType,
          metric,
          startDate,
          endDate
        );
        setComparisonData(comparison.comparison || comparison);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load analytics');
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
              {comparisonData.change_percentage && (
                <div className={`flex items-center gap-1 ${
                  comparisonData.change_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {comparisonData.change_percentage >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(comparisonData.change_percentage).toFixed(1)}%
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
                {comparisonData.difference?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-400">Difference</p>
            </div>
          </div>
        </div>
      )}

      {/* Time Series Chart */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <h2 className="text-xl font-semibold mb-6">Time Series</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading chart data...</div>
          </div>
        ) : timeSeriesData && timeSeriesData.length > 0 ? (
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            <div className="h-64 flex items-end justify-between gap-2">
              {timeSeriesData.map((point: any, index: number) => {
                const maxValue = Math.max(...timeSeriesData.map((p: any) => p.value || 0));
                const height = maxValue > 0 ? ((point.value || 0) / maxValue) * 100 : 0;
                
                return (
                  <div key={point.date || point.period || index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-white rounded-t transition-all hover:bg-gray-200 cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${point.date || point.period}: ${point.value?.toLocaleString() || 0}`}
                    />
                    <div className="mt-2 text-xs text-gray-500 text-center transform -rotate-45 origin-top-left whitespace-nowrap">
                      {point.date 
                        ? new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : point.period}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Data points */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-white/10">
              {timeSeriesData.slice(0, 12).map((point: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-semibold">{formatValue(point.value || 0)}</div>
                  <div className="text-xs text-gray-500">
                    {point.date 
                      ? new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : point.period}
                  </div>
                </div>
              ))}
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
