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

  const data: SuccessResponse<{ token: string }> = await response.json();
  return data.data.token;
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

  // Register returns 201 with null data
  if (response.status !== 201) {
    throw new Error('Registration failed');
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

  // Activation returns 204 No Content
  if (response.status !== 204) {
    throw new Error('Activation failed');
  }
}

// ==================== Projects ====================

export async function getProjects() {
  const response = await fetch(`${API_URL}/v1/projects`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data: SuccessResponse<any[]> | any[] = await response.json();
  
  // Handle both wrapped and unwrapped responses
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as SuccessResponse<any[]>).data || [];
  }
  
  // If it's already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // Fallback to empty array
  return [];
}

export async function getProjectOverview(projectId: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/overview?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function createProject(name: string, slug: string, description?: string, settings?: Record<string, any>) {
  const response = await fetch(`${API_URL}/v1/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name,
      slug,
      description: description || '',
      settings: settings || {},
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  const data: SuccessResponse<any> = await response.json();
  return data.data;
}

// ==================== Events ====================

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
) {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);
  if (options?.eventType) params.append('event_type', options.eventType);
  if (options?.anonymousId) params.append('anonymous_id', options.anonymousId);
  if (options?.externalUserId) params.append('external_user_id', options.externalUserId);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/events?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

// ==================== Users ====================

export async function getUsers(
  projectId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/users?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getUserSummary(projectId: string, externalUserId: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/users/${externalUserId}/summary?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getUserJourney(
  projectId: string,
  userId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/users/${userId}/journey?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

// ==================== Funnels ====================

export async function getFunnels(
  projectId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/funnels?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getFunnelDetails(projectId: string, funnelId: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/funnels/${funnelId}/details?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  return response.json();
}

// ==================== Journeys ====================

export async function getJourneyDropOffAnalysis(
  projectId: string,
  startDate: string,
  endDate: string,
  limit?: number
) {
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

  return response.json();
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

  const response = await fetch(`${API_URL}/v1/projects/${projectId}/analytics/time-series?${params}`, {
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
  custom_weight?: number;
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
  customWeight?: number,
  description?: string
): Promise<EventType> {
  const response = await fetch(`${API_URL}/v1/events/types`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      project_id: projectId,
      event_name: eventName,
      taxonomy_id: taxonomyId,
      custom_weight: customWeight,
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

