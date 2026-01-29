import { useState, useEffect, useRef, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';

export interface RealtimeEvent {
  id: string;
  event_type: string;
  project_id: string;
  session_id: string;
  anonymous_id: string;
  created_at: string;
  properties: Record<string, any>;
  context?: Record<string, any>;
}

interface ConnectionMessage {
  type: 'connected';
  message: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseRealtimeEventsOptions {
  projectId: string | null;
  maxEvents?: number;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

export function useRealtimeEvents({
  projectId,
  maxEvents = 100,
  autoReconnect = true,
  reconnectDelay = 3000,
}: UseRealtimeEventsOptions) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const bufferRef = useRef<string>('');
  const currentEventDataRef = useRef<string>('');
  const seenEventIdsRef = useRef<Set<string>>(new Set());

  const connect = useCallback(async () => {
    if (!projectId) {
      setStatus('disconnected');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('No authentication token');
      setStatus('error');
      return;
    }

    // Clean up previous connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setStatus('connecting');
      setError(null);
      bufferRef.current = '';
      currentEventDataRef.current = '';
      // don't clear seen ids here; we want to avoid duplicates across reconnects

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(
        `${API_URL}/v1/projects/${projectId}/events/stream`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          mode: 'cors',
          // We don't send cookies for this stream; if you ever do, add:
          // credentials: 'include',
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch (e) {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      setStatus('connected');
      reconnectAttemptsRef.current = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (isMountedRef.current) {
            setStatus('disconnected');
          }
          break;
        }

        // Robust SSE parsing: chunks can split lines / JSON across reads.
        bufferRef.current += decoder.decode(value, { stream: true });
        const lines = bufferRef.current.split('\n');
        bufferRef.current = lines.pop() ?? '';

        const flushCurrentEvent = () => {
          const payload = currentEventDataRef.current.trim();
          currentEventDataRef.current = '';
          if (!payload) return;

          try {
            const data = JSON.parse(payload);

            if (data?.type === 'connected') {
              const msg = data as ConnectionMessage;
              console.log('SSE Connected:', msg.message);
              return;
            }

            if (isMountedRef.current) {
              setEvents((prev) => {
                const evt = data as RealtimeEvent;
                if (evt?.id && (seenEventIdsRef.current.has(evt.id) || prev.some((p) => p?.id === evt.id))) {
                  return prev;
                }
                if (evt?.id) seenEventIdsRef.current.add(evt.id);
                const next = [evt, ...prev];
                return next.slice(0, maxEvents);
              });
            }
          } catch (e) {
            console.warn('Failed to parse SSE event payload:', e);
          }
        };

        for (let rawLine of lines) {
          const line = rawLine.replace(/\r$/, '');

          // Heartbeats/comments per SSE spec
          if (line.startsWith(':')) {
            continue;
          }

          // Blank line indicates end of an SSE event
          if (line === '') {
            flushCurrentEvent();
            continue;
          }

          // Accumulate data lines (SSE allows multiple data: lines per event)
          if (line.startsWith('data:')) {
            const chunkPayload = line.replace(/^data:\s?/, '');
            // Preserve newlines between multi-line data chunks
            currentEventDataRef.current += (currentEventDataRef.current ? '\n' : '') + chunkPayload;
            continue;
          }

          // Ignore other SSE fields (event:, id:, retry:) for now
        }

        // If the server sent a complete JSON payload without a trailing blank line yet,
        // try to flush it when it already looks parseable.
        if (currentEventDataRef.current && currentEventDataRef.current.trim().endsWith('}')) {
          flushCurrentEvent();
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Intentional disconnect
        return;
      }

      const rawMsg = String(error?.message || '');
      const isNetworkLoadFailed =
        error?.name === 'TypeError' &&
        (rawMsg.toLowerCase().includes('load failed') || rawMsg.toLowerCase().includes('failed to fetch'));

      // Browsers often log "TypeError: Load failed" for network/CORS/connection resets.
      // Avoid scaring dev console with noisy stack traces; we surface a user-friendly message instead.
      if (isNetworkLoadFailed) {
        console.warn('[SSE] Connection failed (network/CORS).');
      } else {
        console.error('SSE connection error:', error);
      }
      
      if (isMountedRef.current) {
        // Provide more user-friendly error messages
        let errorMessage = error?.message || 'Connection failed';

        // Browser/network-level failures often show up as TypeError: Load failed / Failed to fetch
        if (
          error?.name === 'TypeError' &&
          (String(errorMessage).toLowerCase().includes('load failed') ||
            String(errorMessage).toLowerCase().includes('failed to fetch'))
        ) {
          errorMessage =
            'Connection failed (network/CORS). Check the backend is running and CORS allows text/event-stream.';
        } else if (errorMessage.includes('500')) {
          errorMessage = 'Server error. The real-time events endpoint may not be available yet.';
        } else if (errorMessage.includes('404')) {
          errorMessage = 'Endpoint not found. Real-time events may not be enabled for this project.';
        } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
          errorMessage = 'Authentication failed. Please log in again.';
        }
        
        setError(errorMessage);
        setStatus('error');

        // Only auto-reconnect for network errors, not server errors
        const isServerError =
          errorMessage.includes('500') ||
          errorMessage.includes('404') ||
          errorMessage.includes('401') ||
          errorMessage.includes('403');
        
        if (autoReconnect && !isServerError) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, Math.min(delay, 30000)); // Max 30 seconds
        }
      }
    }
  }, [projectId, maxEvents, autoReconnect, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    seenEventIdsRef.current.clear();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (projectId) {
      connect();
    }

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [projectId, connect, disconnect]);

  return {
    events,
    status,
    error,
    connect,
    disconnect,
    clearEvents,
  };
}
