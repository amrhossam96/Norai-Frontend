'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { setAuthToken } from '@/lib/auth';
import { toast } from 'sonner';
import NoraiLogo from '@/components/ui/NoraiLogo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for OAuth error
      const oauthError = searchParams.get('error');
      if (oauthError) {
        const errorMessage = oauthError === 'access_denied' 
          ? 'Sign-in was cancelled' 
          : 'Sign-in failed. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // Check for token in URL (if backend redirects with token)
      const token = searchParams.get('token');
      if (token) {
        setAuthToken(token);
        toast.success('Signed in successfully!');
        router.push('/dashboard');
        return;
      }

      // Check for code and state (OAuth flow)
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (code && state) {
        try {
          const response = await fetch(
            `${API_URL}/v1/auth/google/callback?code=${code}&state=${state}`,
            { credentials: 'include' }
          );

          if (!response.ok) {
            throw new Error('Failed to complete sign-in');
          }

          const json = await response.json();
          const data = json.data || json;

          if (data.token) {
            setAuthToken(data.token);
            
            // Store user info if available
            if (data.user) {
              if (data.user.email) localStorage.setItem('user_email', data.user.email);
              if (data.user.avatar_url) localStorage.setItem('user_avatar_url', data.user.avatar_url);
              if (data.user.first_name) localStorage.setItem('user_first_name', data.user.first_name);
              if (data.user.last_name) localStorage.setItem('user_last_name', data.user.last_name);
            }
            
            toast.success('Signed in successfully!');
            router.push('/dashboard');
          } else {
            throw new Error('No token received');
          }
        } catch (err: any) {
          setError('Failed to complete sign-in');
          toast.error(err.message || 'Failed to complete sign-in');
          setTimeout(() => router.push('/login'), 2000);
        }
        return;
      }

      // No valid parameters
      setError('Invalid callback');
      toast.error('Invalid sign-in callback');
      setTimeout(() => router.push('/login'), 2000);
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <NoraiLogo size="lg" showText={true} />
        </div>
        {error ? (
          <>
            <div className="text-red-400 mb-4">{error}</div>
            <p className="text-gray-400 text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
            <p className="text-gray-400">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
}
