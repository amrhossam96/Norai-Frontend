export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  // Validate that token is a real value, not "null", "undefined", or empty
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    return null;
  }
  return token;
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  // Don't store invalid tokens
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    console.error('Attempted to store invalid auth token:', token);
    return;
  }
  localStorage.setItem('auth_token', token);
  // Also set cookie for middleware (URL-encode to handle special chars)
  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
  // Debug: log token storage
  console.log('[Auth] Token stored, length:', token.length);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_email');
  // Also remove cookie
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return token !== null && token.length > 0;
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) {
    console.warn('[Auth] No token available for request');
    return {
      'Content-Type': 'application/json',
    };
  }
  // Debug: log token being sent
  console.log('[Auth] Sending token, length:', token.length);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

