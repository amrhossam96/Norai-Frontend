'use client';

import { BarChart3, Users, Activity, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProjectOverview } from '@/lib/api-client';
import { toast } from 'sonner';
import { useDashboard } from '@/contexts/DashboardContext';
import UserMap from '@/components/dashboard/UserMap';

export default function DashboardPage() {
  const { selectedProjectId } = useDashboard();
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      if (!selectedProjectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getProjectOverview(selectedProjectId);
        setOverview(data.overview);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadOverview();
  }, [selectedProjectId]);
  const stats = [
    {
      label: 'Total Events',
      value: '1,234,567',
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
    },
    {
      label: 'Active Users',
      value: '45,678',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
    },
    {
      label: 'Conversion Rate',
      value: '3.24%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Avg. Session',
      value: '4m 32s',
      change: '-1.3%',
      trend: 'down',
      icon: BarChart3,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No Project Selected</h2>
          <p className="text-gray-400 mb-6">
            Select a project from the dropdown above or create a new one to get started with your analytics dashboard.
          </p>
          <div className="text-sm text-gray-500">
            <p>Once you have a project, you'll be able to:</p>
            <ul className="mt-3 space-y-2 text-left max-w-xs mx-auto">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                Track events and user behavior
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                Analyze funnels and user journeys
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                Generate recommendations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                View real-time analytics
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Always show dashboard structure, even with no data
  const hasData = overview && (overview.events > 0 || overview.dau > 0 || overview.sessions > 0);
  const topEvents = overview?.top_events || [];
  const totalEvents = overview?.events || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">
          {hasData 
            ? "Welcome back! Here's what's happening with your data."
            : "Start tracking events to see your analytics data here. Install the SDK and begin sending events to populate this dashboard."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">
              {overview?.events ? overview.events.toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-400">Total Events</p>
            {!hasData && (
              <p className="text-xs text-gray-500 mt-1">Track user actions</p>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">
              {overview?.dau ? overview.dau.toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-400">Daily Active Users</p>
            {!hasData && (
              <p className="text-xs text-gray-500 mt-1">Users who interacted today</p>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">
              {overview?.sessions ? overview.sessions.toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-400">Sessions</p>
            {!hasData && (
              <p className="text-xs text-gray-500 mt-1">User sessions tracked</p>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">
              {overview?.mau ? overview.mau.toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-400">Monthly Active Users</p>
            {!hasData && (
              <p className="text-xs text-gray-500 mt-1">Users in the last 30 days</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Map */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
          <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
          <div className="h-64">
            <UserMap
              data={[
                { code: 'NA', name: 'North America', users: overview?.users_by_region?.na || 12500 },
                { code: 'SA', name: 'South America', users: overview?.users_by_region?.sa || 3200 },
                { code: 'EU', name: 'Europe', users: overview?.users_by_region?.eu || 18900 },
                { code: 'AS', name: 'Asia', users: overview?.users_by_region?.as || 24500 },
                { code: 'OC', name: 'Oceania', users: overview?.users_by_region?.oc || 1800 },
                { code: 'AF', name: 'Africa', users: overview?.users_by_region?.af || 4200 },
              ]}
              height={256}
            />
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
          <h2 className="text-xl font-semibold mb-4">Top Events</h2>
          <div className="space-y-4">
            {topEvents.length > 0 ? (
              topEvents.map((event: any, index: number) => {
                const percentage = totalEvents > 0 ? (event.count / totalEvents) * 100 : 0;
                return (
                  <div key={event.event_type || index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{event.event_type}</span>
                      <span className="text-sm text-gray-400">{event.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-3">
                <div className="text-gray-500 text-sm">
                  <p className="mb-2">Most frequent events will appear here:</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                      <span className="text-gray-400">event_name</span>
                      <span className="text-gray-500">0</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-white/10 h-2 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {hasData ? (
            <div className="space-y-3">
              {[
                { action: 'New user registered', time: '2 minutes ago', type: 'user' },
                { action: 'Event tracked: product_viewed', time: '5 minutes ago', type: 'event' },
                { action: 'Recommendation generated', time: '12 minutes ago', type: 'recommendation' },
                { action: 'Funnel created', time: '1 hour ago', type: 'funnel' },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-white/5 rounded border border-white/10">
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              <p className="mb-3">Recent events and actions will appear here:</p>
              <div className="space-y-2">
                {['Event tracked', 'User registered', 'Recommendation generated', 'Funnel created'].map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 opacity-50"
                  >
                    <div>
                      <p className="text-sm text-gray-500">{action}</p>
                      <p className="text-xs text-gray-600 mt-1">N/A</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-white/5 rounded border border-white/10 text-gray-500">
                      {action.split(' ')[0].toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

