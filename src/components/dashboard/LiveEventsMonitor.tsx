'use client';

import { useMemo, useState } from 'react';
import { Radio, X, Play, Pause, Trash2, Filter } from 'lucide-react';
import { useRealtimeEvents, RealtimeEvent } from '@/hooks/useRealtimeEvents';
import { useDashboard } from '@/contexts/DashboardContext';
import Select from '@/components/ui/select';

export default function LiveEventsMonitor() {
  const { selectedProjectId } = useDashboard();
  const [isPaused, setIsPaused] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  
  const {
    events,
    status,
    error,
    connect,
    disconnect,
    clearEvents,
  } = useRealtimeEvents({
    projectId: selectedProjectId,
    maxEvents: 200,
    autoReconnect: true,
  });

  // Get unique event types for filter
  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.event_type));
    return Array.from(types).sort();
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!eventTypeFilter) return events;
    return events.filter(e => e.event_type === eventTypeFilter);
  }, [events, eventTypeFilter]);

  const handleToggle = () => {
    if (isPaused) {
      connect();
      setIsPaused(false);
    } else {
      disconnect();
      setIsPaused(true);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to view live events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status === 'connected' ? 'animate-pulse' : ''}`} />
            <h2 className="text-xl font-semibold">Live Events</h2>
            <span className="text-sm text-gray-500">({filteredEvents.length})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Event Type Filter */}
          {eventTypes.length > 0 && (
            <Select
              value={eventTypeFilter}
              onChange={setEventTypeFilter}
              options={[
                { value: '', label: 'All Event Types' },
                ...eventTypes.map(type => ({ value: type, label: type })),
              ]}
              placeholder="Filter by type"
              className="w-48"
            />
          )}
          
          {/* Controls */}
          <button
            onClick={handleToggle}
            className="p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={clearEvents}
            className="p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
            title="Clear Events"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'connected' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">{getStatusText()}</span>
            {error && (
              <span className="text-xs text-red-400 max-w-md truncate" title={error}>
                ({error})
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} received
          </div>
        </div>
        {error && status === 'error' && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-red-400">{error}</p>
            <button
              onClick={() => {
                setError(null);
                connect();
              }}
              className="mt-2 text-xs text-white hover:text-gray-300 underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Radio className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-2">
              {status === 'connected' ? 'Waiting for events...' : 'Not connected'}
            </p>
            <p className="text-sm text-gray-500">
              {status === 'connected' 
                ? 'Events will appear here as they are received'
                : 'Connect to start receiving live events'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredEvents.map((event, idx) => (
              <EventCard key={`${event.id}-${event.created_at ?? ''}-${idx}`} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: RealtimeEvent }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-white/10 rounded text-sm font-medium border border-white/20">
              {event.event_type}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(event.created_at).toLocaleTimeString()}
            </span>
          </div>
          
          {event.anonymous_id && (
            <div className="text-xs text-gray-500 font-mono mb-1">
              Anonymous: {event.anonymous_id.substring(0, 8)}...
            </div>
          )}
          
          {event.session_id && (
            <div className="text-xs text-gray-500 font-mono">
              Session: {event.session_id.substring(0, 8)}...
            </div>
          )}
        </div>
        
        <X
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
            isExpanded ? 'rotate-45' : ''
          }`}
        />
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          {event.properties && Object.keys(event.properties).length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Properties:</div>
              <pre className="text-xs bg-black/20 p-3 rounded overflow-x-auto">
                {JSON.stringify(event.properties, null, 2)}
              </pre>
            </div>
          )}
          
          {event.context && Object.keys(event.context).length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Context:</div>
              <pre className="text-xs bg-black/20 p-3 rounded overflow-x-auto">
                {JSON.stringify(event.context, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <div>Event ID: <span className="font-mono">{event.id}</span></div>
            <div>Created: {new Date(event.created_at).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
