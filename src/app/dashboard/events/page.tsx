'use client';

import { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight, Radio, X } from 'lucide-react';
import { getEvents } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';
import EventTypeRegistration from '@/components/dashboard/EventTypeRegistration';
import LiveEventsMonitor from '@/components/dashboard/LiveEventsMonitor';

export default function EventsPage() {
  const { selectedProjectId } = useDashboard();
  const [viewMode, setViewMode] = useState<'history' | 'live'>('history');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [returned, setReturned] = useState(0);
  const limit = 20;

  // Filters
  const [eventType, setEventType] = useState('');
  const [anonymousId, setAnonymousId] = useState('');
  const [externalUserId, setExternalUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate offset from page
  const offset = (page - 1) * limit;

  useEffect(() => {
    const loadEvents = async () => {
      if (!selectedProjectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getEvents(selectedProjectId, {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          eventType: eventType || undefined,
          anonymousId: anonymousId || undefined,
          externalUserId: externalUserId || undefined,
          limit,
          offset,
        });

        // Response structure: { events: [], pagination: { has_more, limit, offset, returned, total } }
        const eventsData = response.events || [];
        const returnedCount = response.pagination?.returned ?? eventsData.length ?? 0;
        const totalCount = response.pagination?.total;

        setEvents(eventsData);
        setReturned(returnedCount);
        setTotal(typeof totalCount === 'number' ? totalCount : 0);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load events');
        setEvents([]);
        setReturned(0);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [selectedProjectId, page, offset, eventType, anonymousId, externalUserId, startDate, endDate]);

  const handleResetFilters = () => {
    setEventType('');
    setAnonymousId('');
    setExternalUserId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  const getEventTimestamp = (event: any): string | null => {
    const raw = event?.timestamp || event?.occurred_at || event?.created_at;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString();
  };

  const getEventPropertiesCount = (event: any): number => {
    const props = event?.properties;
    if (!props || typeof props !== 'object') return 0;
    return Object.keys(props).length;
  };

  const safeJson = (value: any): string => {
    try {
      return JSON.stringify(value ?? {}, null, 2);
    } catch {
      return String(value);
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to view events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Events</h1>
        <p className="text-gray-400">View and analyze all tracked events</p>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-1 inline-flex">
        <button
          onClick={() => setViewMode('history')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
            viewMode === 'history'
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setViewMode('live')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-2 ${
            viewMode === 'live'
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          Live
        </button>
      </div>

      {/* Live Events View */}
      {viewMode === 'live' && <LiveEventsMonitor />}

      {/* History View */}
      {viewMode === 'history' && (
        <>
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

      {/* Table + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6">
        {/* Events Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
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
              <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-white/5 border-b border-white/10">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Event Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Anonymous ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Timestamp</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Properties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(events) && events.map((event, index) => {
                      const isSelected = !!(selectedEvent?.id && event?.id && selectedEvent.id === event.id);
                      return (
                        <tr
                          key={event.id || index}
                          onClick={() => setSelectedEvent(event)}
                          className={[
                            'border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer',
                            isSelected ? 'bg-white/10' : '',
                          ].join(' ')}
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
                            {getEventTimestamp(event) || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {getEventPropertiesCount(event) > 0 ? (
                              <span className="text-xs text-gray-500">
                                {getEventPropertiesCount(event)} properties
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10 flex-shrink-0">
                  <div className="text-sm text-gray-400">
                    Showing {returned > 0 ? offset + 1 : 0} to {offset + returned} of {(total || 0).toLocaleString()} events
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

        {/* Details Panel */}
        <div className="hidden lg:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-5" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400">Event Details</div>
              <div className="text-lg font-semibold">
                {selectedEvent?.event_type || 'Select an event'}
              </div>
            </div>
            {selectedEvent && (
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto pr-1 pb-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {!selectedEvent ? (
              <div className="text-sm text-gray-500">
                Click any row in the table to inspect its properties and context.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-gray-500">
                  <div>ID: <span className="font-mono text-gray-300">{selectedEvent.id || '-'}</span></div>
                  <div>Anonymous: <span className="font-mono text-gray-300">{selectedEvent.anonymous_id || '-'}</span></div>
                  <div>User: <span className="font-mono text-gray-300">{selectedEvent.external_user_id || '-'}</span></div>
                  <div>Session: <span className="font-mono text-gray-300">{selectedEvent.session_id || '-'}</span></div>
                  <div>Time: <span className="text-gray-300">{getEventTimestamp(selectedEvent) || 'N/A'}</span></div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-2">Properties</div>
                  <pre className="text-xs bg-black/20 p-3 rounded-lg overflow-auto max-h-[260px] border border-white/10">
                    {safeJson(selectedEvent.properties)}
                  </pre>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-2">Context</div>
                  <pre className="text-xs bg-black/20 p-3 rounded-lg overflow-auto max-h-[200px] border border-white/10">
                    {safeJson(selectedEvent.context)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {selectedEvent && (
        <div className="lg:hidden fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-[420px] bg-black/60 backdrop-blur-xl border-l border-white/10 p-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-400">Event Details</div>
                <div className="text-lg font-semibold">{selectedEvent.event_type || 'N/A'}</div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 pb-4">
              <div className="text-xs text-gray-500">
                <div>ID: <span className="font-mono text-gray-300">{selectedEvent.id || '-'}</span></div>
                <div>Anonymous: <span className="font-mono text-gray-300">{selectedEvent.anonymous_id || '-'}</span></div>
                <div>User: <span className="font-mono text-gray-300">{selectedEvent.external_user_id || '-'}</span></div>
                <div>Session: <span className="font-mono text-gray-300">{selectedEvent.session_id || '-'}</span></div>
                <div>Time: <span className="text-gray-300">{getEventTimestamp(selectedEvent) || 'N/A'}</span></div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-2">Properties</div>
                <pre className="text-xs bg-black/20 p-3 rounded-lg overflow-auto max-h-[280px] border border-white/10">
                  {safeJson(selectedEvent.properties)}
                </pre>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-2">Context</div>
                <pre className="text-xs bg-black/20 p-3 rounded-lg overflow-auto max-h-[240px] border border-white/10">
                  {safeJson(selectedEvent.context)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
