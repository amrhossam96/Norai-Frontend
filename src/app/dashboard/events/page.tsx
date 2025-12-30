'use client';

import { useState, useEffect } from 'react';
import { Calendar, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEvents } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';
import EventTypeRegistration from '@/components/dashboard/EventTypeRegistration';

export default function EventsPage() {
  const { selectedProjectId } = useDashboard();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [eventType, setEventType] = useState('');
  const [anonymousId, setAnonymousId] = useState('');
  const [externalUserId, setExternalUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      if (!selectedProjectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const response = await getEvents(selectedProjectId, {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          eventType: eventType || undefined,
          anonymousId: anonymousId || undefined,
          externalUserId: externalUserId || undefined,
          limit,
          offset,
        });

        // Handle both wrapped and unwrapped responses
        let eventsData: any[] = [];
        let totalCount = 0;

        if (Array.isArray(response)) {
          eventsData = response;
          totalCount = response.length;
        } else if (response && typeof response === 'object') {
          // Try different possible response structures
          eventsData = response.data || response.events || response.results || [];
          totalCount = response.total || response.count || response.total_count || eventsData.length;
        }

        // Ensure eventsData is always an array
        if (!Array.isArray(eventsData)) {
          eventsData = [];
        }

        setEvents(eventsData);
        setTotal(totalCount);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load events');
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [selectedProjectId, page, eventType, anonymousId, externalUserId, startDate, endDate]);

  const handleResetFilters = () => {
    setEventType('');
    setAnonymousId('');
    setExternalUserId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to view events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Events</h1>
        <p className="text-gray-400">View and analyze all tracked events</p>
      </div>

      {/* Event Type Registration */}
      {selectedProjectId ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Register Event Type</h2>
            <p className="text-sm text-gray-400">
              Register a new event type and assign it to a taxonomy
            </p>
          </div>
          <EventTypeRegistration
            projectId={selectedProjectId}
            onEventTypeCreated={() => {
              // Optionally refresh events list
            }}
          />
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Register Event Type</h2>
            <p className="text-sm text-gray-400">
              Register a new event type and assign it to a taxonomy
            </p>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">Select a project to register event types</p>
            <p className="text-sm text-gray-500">
              Choose a project from the dropdown above to start registering event types
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {(eventType || anonymousId || externalUserId || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-sm text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="e.g., page_view"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Anonymous ID</label>
            <input
              type="text"
              value={anonymousId}
              onChange={(e) => setAnonymousId(e.target.value)}
              placeholder="Anonymous user ID"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
            <input
              type="text"
              value={externalUserId}
              onChange={(e) => setExternalUserId(e.target.value)}
              placeholder="External user ID"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
            />
          </div>

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

      {/* Events Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Events ({(total || 0).toLocaleString()})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading events...</div>
          </div>
        ) : !Array.isArray(events) || events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No events found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or start tracking events</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Event Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Anonymous ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Properties</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(events) && events.map((event, index) => (
                    <tr
                      key={event.id || index}
                      className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-sm font-medium">
                          {event.event_type || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {event.external_user_id || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300 font-mono text-xs">
                        {event.anonymous_id ? event.anonymous_id.substring(0, 8) + '...' : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {event.timestamp
                          ? new Date(event.timestamp).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {event.properties ? (
                          <span className="text-xs text-gray-500">
                            {Object.keys(event.properties).length} properties
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total || 0)} of {(total || 0).toLocaleString()} events
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-400 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
