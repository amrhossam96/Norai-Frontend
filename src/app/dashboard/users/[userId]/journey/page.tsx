'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { getUserJourney, UserJourney } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';

export default function UserJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedProjectId } = useDashboard();
  const userId = params.userId as string;
  
  const [journey, setJourney] = useState<UserJourney | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [filterEventType, setFilterEventType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Default to last 30 days
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
    const loadJourney = async () => {
      if (!selectedProjectId || !userId) {
        return;
      }

      try {
        setIsLoading(true);
        const data = await getUserJourney(selectedProjectId, userId, {
          startDate,
          endDate,
        });
        setJourney(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load user journey');
        setJourney(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadJourney();
  }, [selectedProjectId, userId, startDate, endDate]);

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const formatTimeDifference = (date1: Date, date2: Date): string => {
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays > 0) return `+${diffDays}d`;
    if (diffHours > 0) return `+${diffHours}h`;
    if (diffMins > 0) return `+${diffMins}m`;
    return `+${Math.floor(diffMs / 1000)}s`;
  };

  const getEventTypeColor = (eventType: string): string => {
    const colors: Record<string, string> = {
      'feed_loaded': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'tweet_viewed': 'bg-green-500/20 text-green-400 border-green-500/30',
      'tweet_liked': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'tweet_shared': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'signup': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'login': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return colors[eventType] || 'bg-white/10 text-white border-white/20';
  };

  const getEventTypeIcon = (eventType: string): string => {
    if (eventType.includes('feed')) return '📰';
    if (eventType.includes('tweet')) return '🐦';
    if (eventType.includes('like')) return '❤️';
    if (eventType.includes('share')) return '📤';
    if (eventType.includes('signup') || eventType.includes('register')) return '✨';
    if (eventType.includes('login')) return '🔐';
    return '📌';
  };

  // Filter and search events
  const filteredEvents = journey?.events?.filter((event) => {
    const matchesType = !filterEventType || event.event_type === filterEventType;
    const matchesSearch = !searchQuery || 
      event.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(event.properties).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  // Group events by session
  const groupedBySession = filteredEvents.reduce((acc, event) => {
    const sessionId = event.session_id || 'no-session';
    if (!acc[sessionId]) {
      acc[sessionId] = [];
    }
    acc[sessionId].push(event);
    return acc;
  }, {} as Record<string, typeof filteredEvents>);

  const uniqueEventTypes = Array.from(new Set(journey?.events?.map(e => e.event_type) || []));

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to view user journey.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              User Journey: {journey?.user?.external_user_id || userId}
            </h1>
            <p className="text-gray-400">Event timeline and user behavior</p>
          </div>
        </div>
      </div>

      {/* Date Range */}
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

      {/* Summary Cards */}
      {journey && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="text-sm text-gray-400 mb-1">Total Events</div>
            <div className="text-2xl font-bold">{journey.summary?.total_events || journey.events?.length || 0}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="text-sm text-gray-400 mb-1">First Seen</div>
            <div className="text-lg font-semibold">
              {journey.summary?.first_seen 
                ? new Date(journey.summary.first_seen).toLocaleDateString()
                : 'N/A'}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="text-sm text-gray-400 mb-1">Last Seen</div>
            <div className="text-lg font-semibold">
              {journey.summary?.last_seen 
                ? new Date(journey.summary.last_seen).toLocaleDateString()
                : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Events</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event type or properties..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-pointer"
            >
              <option value="">All Event Types</option>
              {uniqueEventTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        <h2 className="text-lg font-semibold mb-6">Event Timeline</h2>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading journey...</div>
          </div>
        ) : !journey || !journey.events || journey.events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No events found</p>
            <p className="text-sm text-gray-500">Try adjusting the date range or filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedBySession).map(([sessionId, sessionEvents], sessionIndex) => {
              const sortedEvents = [...sessionEvents].sort((a, b) => 
                new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
              );
              
              return (
                <div key={sessionId} className="space-y-4">
                  {sessionId !== 'no-session' && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-px bg-white/20 flex-1" />
                      <span className="text-xs text-gray-500 px-3 py-1 bg-white/5 rounded-full">
                        Session: {sessionId.substring(0, 8)}...
                      </span>
                      <div className="h-px bg-white/20 flex-1" />
                    </div>
                  )}
                  
                  {sortedEvents.map((event, eventIndex) => {
                    const eventDate = new Date(event.occurred_at);
                    const prevEventDate = eventIndex > 0 
                      ? new Date(sortedEvents[eventIndex - 1].occurred_at)
                      : null;
                    const timeDiff = prevEventDate ? formatTimeDifference(prevEventDate, eventDate) : null;
                    const isExpanded = expandedEvents.has(event.event_id);
                    
                    return (
                      <div key={event.event_id} className="relative">
                        {/* Timeline connector */}
                        {eventIndex < sortedEvents.length - 1 && (
                          <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-white/10" />
                        )}
                        
                        <div className="flex gap-4">
                          {/* Event icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${getEventTypeColor(event.event_type)}`}>
                            {getEventTypeIcon(event.event_type)}
                          </div>
                          
                          {/* Event content */}
                          <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-2 py-1 rounded text-sm font-medium border ${getEventTypeColor(event.event_type)}`}>
                                    {event.event_type}
                                  </span>
                                  {timeDiff && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {timeDiff}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400 mb-2">
                                  {eventDate.toLocaleString()}
                                </div>
                                {event.properties && Object.keys(event.properties).length > 0 && (
                                  <button
                                    onClick={() => toggleEventExpanded(event.event_id)}
                                    className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="w-3 h-3" />
                                        Hide Properties
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3 h-3" />
                                        View Properties ({Object.keys(event.properties).length})
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Expanded properties */}
                            {isExpanded && event.properties && (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="text-xs text-gray-400 mb-2">Properties:</div>
                                <pre className="text-xs bg-black/20 p-3 rounded overflow-x-auto">
                                  {JSON.stringify(event.properties, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
