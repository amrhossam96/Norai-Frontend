export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  // Also set cookie for middleware
  document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_email');
  // Also remove cookie
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

