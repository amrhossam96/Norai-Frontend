import { getAuthHeaders } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

// Error response type from backend
interface ErrorResponse {
  error: string;
}

// Success response wrapper from backend
interface SuccessResponse<T> {
  data: T;
}

// Helper to parse error responses
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data: ErrorResponse = await response.json();
    return data.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

// ==================== Authentication ====================

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_URL}/v1/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Extract token from response (handle wrapped and unwrapped)
  let token: string | undefined;
  if (data && typeof data === 'object') {
    if ('data' in data && data.data?.token) {
      token = data.data.token;
    } else if ('token' in data) {
      token = data.token;
    }
  }
  
  // Validate token
  if (!token || typeof token !== 'string' || token.trim() === '') {
    console.error('Invalid token received from login:', data);
    throw new Error('Invalid authentication response from server');
  }
  
  return token;
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<void> {
  const response = await fetch(`${API_URL}/v1/auth/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

export async function activateAccount(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/users/activate/${token}`, {
    method: 'PUT',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Activation token not found or expired');
    }
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

// ==================== Projects ====================

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface ProjectOverview {
  project: Project;
  // Real-time metrics
  active_users_5m: number;
  dau: number;
  wau: number;
  mau: number;
  // Period metrics
  events: number;
  sessions: number;
  new_users: number;
  // Top events
  top_events: Array<{
    event_type: string;
    count: number;
  }>;
  // Funnel previews
  funnels_previews: Array<{
    id: string;
    name: string;
    conversion_rate: number;
  }>;
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/v1/projects`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data || [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export async function createProject(
  name: string,
  description?: string
): Promise<Project> {
  const response = await fetch(`${API_URL}/v1/projects`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description: description || '',
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }
  return data;
}

export async function updateProject(
  projectId: string,
  updates: {
    name?: string;
    description?: string;
  }
): Promise<Project> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }
  return data;
}

export async function archiveProject(projectId: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/archive`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

export async function getProjectOverview(
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<ProjectOverview> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const queryString = params.toString();
  const url = queryString 
    ? `${API_URL}/v1/projects/${projectId}/overview?${queryString}`
    : `${API_URL}/v1/projects/${projectId}/overview`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // Backend returns { data: { overview: { ... } } }
  if (data && typeof data === 'object') {
    if ('data' in data && data.data?.overview) {
      return data.data.overview;
    }
    if ('data' in data) {
      return data.data;
    }
    if ('overview' in data) {
      return data.overview;
    }
  }
  return data;
}

// ==================== Events ====================

export interface Event {
  id: string;
  event_type: string;
  occurred_at: string;
  properties: Record<string, any>;
  session_id?: string;
  user_id?: string;
}

export interface PaginationMetadata {
  has_more: boolean;
  limit: number;
  offset: number;
}

export interface EventsListResponse {
  events: Event[];
  pagination: PaginationMetadata;
}

export async function getEvents(
  projectId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    anonymousId?: string;
    externalUserId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<EventsListResponse> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);
  if (options?.eventType) params.append('event_type', options.eventType);
  if (options?.anonymousId) params.append('anonymous_id', options.anonymousId);
  if (options?.externalUserId) params.append('external_user_id', options.externalUserId);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset !== undefined) params.append('offset', options.offset.toString());

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/events?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const json = await response.json();
  // Response is wrapped: { data: { events: [], pagination: {} } }
  if (json && typeof json === 'object' && 'data' in json) {
    return {
      events: json.data.events || [],
      pagination: json.data.pagination || { has_more: false, limit: 20, offset: 0 },
    };
  }
  return json;
}

// ==================== Users ====================

export interface AppUser {
  id: string;
  project_id: string;
  external_user_id: string;
  traits: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UsersListResponse {
  users: AppUser[];
  has_more: boolean;
}

export async function getUsers(
  projectId: string,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<UsersListResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/users?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const json = await response.json();
  // Response is wrapped: { data: { users: [], has_more: bool } }
  if (json && typeof json === 'object' && 'data' in json) {
    return {
      users: json.data.users || [],
      has_more: json.data.has_more || false,
    };
  }
  return json;
}

export async function getUserDetails(projectId: string, userId: string): Promise<AppUser> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const json = await response.json();
  // Response is wrapped: { data: { user: {} } }
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data.user || json.data;
  }
  return json;
}

export interface UserSummary {
  total_events: number;
  first_seen: string; // ISO string
  last_seen: string; // ISO string
  event_types: string[];
  event_counts_by_type: Record<string, number>;
}

export async function getUserSummary(projectId: string, userId: string): Promise<UserSummary> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/users/${userId}/summary`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const json = await response.json();
  // Response is wrapped: { data: { summary: {} } }
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data.summary;
  }
  return json;
}

export interface UserJourneyEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  properties: Record<string, any>;
  session_id: string;
}

export interface UserJourney {
  user: AppUser;
  events: UserJourneyEvent[];
  summary: {
    total_events: number;
    first_seen: string;
    last_seen: string;
    event_types: string[];
  };
}

export async function getUserJourney(
  projectId: string,
  userId: string,
  options?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<UserJourney> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/users/${userId}/journey?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }
  return data;
}

// ==================== Funnels ====================

export interface FunnelStep {
  id: string;
  event_type_id: string;
  event_type_name: string;
  step_order: number;
}

export interface Funnel {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  steps: FunnelStep[];
  created_at: string;
}

export interface FunnelAnalyticsStep {
  order: number;
  event_type: string;
  users: number;
}

export interface FunnelAnalytics {
  started: number;
  completed: number;
  steps: FunnelAnalyticsStep[];
}

export async function getFunnels(projectId: string): Promise<Funnel[]> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/funnels`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const json = await response.json();
  // Response is wrapped: { data: { funnels: [] } }
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data.funnels || json.data || [];
  }
  if (Array.isArray(json)) {
    return json;
  }
  return [];
}

export async function createFunnel(
  projectId: string,
  name: string,
  steps: Array<{ event_type_id: string }>,
  description?: string
): Promise<Funnel> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/funnels`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      steps,
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }
  return data;
}

export async function getFunnelAnalytics(
  projectId: string,
  funnelId: string,
  startDate?: string,
  endDate?: string
): Promise<FunnelAnalytics> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const queryString = params.toString();
  // Use /details endpoint for analytics with user counts and conversion rates
  const url = queryString
    ? `${API_URL}/v1/projects/${projectId}/funnels/${funnelId}/details?${queryString}`
    : `${API_URL}/v1/projects/${projectId}/funnels/${funnelId}/details`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // Response is wrapped in data.funnel
  if (data && typeof data === 'object') {
    if ('data' in data && data.data?.funnel) {
      return data.data.funnel;
    }
    if ('funnel' in data) {
      return data.funnel;
    }
  }
  return data;
}

export async function updateFunnel(
  projectId: string,
  funnelId: string,
  updates: {
    name?: string;
    description?: string;
    steps?: Array<{ event_type_id: string }>;
  }
): Promise<Funnel> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/funnels/${funnelId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }
  return data;
}

export async function deleteFunnel(projectId: string, funnelId: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/funnels/${funnelId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

// ==================== Journeys ====================

export interface EventTypeDropOff {
  event_type: string;
  users_reached: number;
  users_continued: number;
  users_dropped_off: number;
  drop_off_rate: number;
  average_time_after: number;
}

export interface LastEventStat {
  event_type: string;
  count: number;
  percentage: number;
  average_position: number;
}

export interface JourneyDropOffAnalysis {
  total_users_analyzed: number;
  average_journey_length: number;
  median_journey_length: number;
  common_last_events: LastEventStat[];
  drop_off_by_event_type: EventTypeDropOff[];
  average_time_to_drop_off: number;
  period?: {
    start_date: string;
    end_date: string;
  };
}

export async function getJourneyDropOffAnalysis(
  projectId: string,
  startDate: string,
  endDate: string,
  limit?: number
): Promise<JourneyDropOffAnalysis> {
  const params = new URLSearchParams();
  params.append('start_date', startDate);
  params.append('end_date', endDate);
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/journeys/drop-off-analysis?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // Response is wrapped in data.analysis
  if (data && typeof data === 'object') {
    if ('data' in data && data.data?.analysis) {
      return data.data.analysis;
    }
    if ('analysis' in data) {
      return data.analysis;
    }
  }
  return data;
}

// ==================== Entity Insights ====================

export interface EntityInsights {
  entity_id: string;
  project_id: string;
  impressions_count: number;
  views_count: number;
  clicks_count: number;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  saves_count: number;
  dismiss_count: number;
  first_seen_at: string;
  last_seen_at: string;
  last_viewed_at: string;
  last_clicked_at: string;
}

export async function getEntityInsights(
  projectId: string,
  entityId: string
): Promise<EntityInsights> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/entity/${entityId}/insights`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }
  return data;
}

// ==================== Analytics ====================

export async function getTimeSeries(
  projectId: string,
  period: 'day' | 'week' | 'month',
  metric: 'events' | 'sessions' | 'active_users',
  startDate: string,
  endDate: string
) {
  const params = new URLSearchParams();
  params.append('period', period);
  params.append('metric', metric);
  params.append('start_date', startDate);
  params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/analytics/timeseries?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getComparison(
  projectId: string,
  type: 'wow' | 'mom',
  metric: 'events' | 'sessions' | 'active_users',
  startDate: string,
  endDate: string
) {
  const params = new URLSearchParams();
  params.append('type', type);
  params.append('metric', metric);
  params.append('start_date', startDate);
  params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/analytics/comparison?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

// ==================== API Keys ====================

export interface APIKey {
  id: string;
  project_id: string;
  name: string;
  status: 'active' | 'revoked';
  created_by: string;
  created_at: string;
  last_used_at?: string;
  revoked_at?: string;
}

export interface CreateAPIKeyResponse {
  id: string;
  apiKey: string; // Only shown once when created
}

export async function getAPIKeys(projectId: string) {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/api-keys`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data: SuccessResponse<APIKey[]> | APIKey[] = await response.json();
  
  // Handle both wrapped and unwrapped responses
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as SuccessResponse<APIKey[]>).data || [];
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  return [];
}

export async function createAPIKey(projectId: string, name: string): Promise<CreateAPIKeyResponse> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/api-keys`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const rawData = await response.json();
  
  // Handle different response structures
  let data: CreateAPIKeyResponse;
  
  if (rawData && typeof rawData === 'object') {
    if ('data' in rawData) {
      data = (rawData as SuccessResponse<CreateAPIKeyResponse>).data;
    } else {
      data = rawData as CreateAPIKeyResponse;
    }
  } else {
    throw new Error('Invalid response format');
  }
  
  return data;
}

export async function revokeAPIKey(projectId: string, keyId: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/projects/${projectId}/api-keys/${keyId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

// ==================== Event Taxonomies ====================

export interface EventTaxonomy {
  id: string;
  category_name: string;
  weight: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export async function getEventTaxonomies(): Promise<EventTaxonomy[]> {
  const response = await fetch(`${API_URL}/v1/events/taxonomies`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data: SuccessResponse<EventTaxonomy[]> | EventTaxonomy[] = await response.json();
  
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as SuccessResponse<EventTaxonomy[]>).data || [];
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  return [];
}

export async function getEventTaxonomyById(taxId: string): Promise<EventTaxonomy> {
  const response = await fetch(`${API_URL}/v1/events/taxonomies/${taxId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data: SuccessResponse<EventTaxonomy> | EventTaxonomy = await response.json();
  
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as SuccessResponse<EventTaxonomy>).data;
  }
  
  return data as EventTaxonomy;
}

export async function createEventTaxonomy(
  categoryName: string,
  weight: number,
  description: string
): Promise<void> {
  const response = await fetch(`${API_URL}/v1/events/taxonomies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      category_name: categoryName,
      weight,
      description,
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

export async function updateEventTaxonomy(
  taxId: string,
  categoryName: string,
  weight: number,
  description: string
): Promise<void> {
  const response = await fetch(`${API_URL}/v1/events/taxonomies/${taxId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      category_name: categoryName,
      weight,
      description,
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

export async function deleteEventTaxonomy(taxId: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/events/taxonomies/${taxId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
}

// ==================== Event Types ====================

export interface EventType {
  id: string;
  project_id: string;
  event_name: string;
  taxonomy_id: string;
  status: 'draft' | 'active' | 'deprecated' | 'blocked';
  source: 'sdk' | 'ui';
  description?: string;
  created_at?: string;
}

export async function getEventTypes(): Promise<EventType[]> {
  const response = await fetch(`${API_URL}/v1/events/types`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data: SuccessResponse<EventType[]> | EventType[] = await response.json();
  
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as SuccessResponse<EventType[]>).data || [];
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  return [];
}

export async function createEventType(
  projectId: string,
  eventName: string,
  taxonomyId: string,
  description?: string
): Promise<EventType> {
  const response = await fetch(`${API_URL}/v1/events/types`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: projectId,
      event_name: eventName,
      taxonomy_id: taxonomyId,
      description: description,
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data: SuccessResponse<EventType> | EventType = await response.json();
  
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as SuccessResponse<EventType>).data;
  }
  
  return data as EventType;
}

