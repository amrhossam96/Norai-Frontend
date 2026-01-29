'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, CheckCircle2, Loader2, Server, Smartphone, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '@/contexts/DashboardContext';
import { createAPIKey, getProjectSetup, updateProjectSetup, getAPIKeys, getEvents } from '@/lib/api-client';
import { CodeHighlighter } from '@/components/code-highlighter';

type SetupStep = 2 | 3 | 4;
type Platform = 'web' | 'ios' | 'android' | 'backend';

export default function ProjectSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedProjectId, setSelectedProjectId } = useDashboard();

  // Determine which project to set up from URL params or context
  const projectIdFromUrl = searchParams.get('projectId');
  
  // Use projectId from URL if provided, otherwise use selectedProjectId
  const targetProjectId = projectIdFromUrl || selectedProjectId;

  const [step, setStep] = useState<SetupStep>(2); // Start at step 2 (platform selection)

  // Platform selection - stored in localStorage during onboarding, cleared when setup completes
  const [platform, setPlatform] = useState<Platform>('web');

  const [projectId, setProjectId] = useState<string | null>(targetProjectId);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);

  // Step 3 – API key
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  // Step 4 – first event
  const [isWaitingForEvent, setIsWaitingForEvent] = useState(false);
  const [hasFirstEvent, setHasFirstEvent] = useState(false);

  // Load setup state on mount or when projectId/URL params change
  useEffect(() => {
    const loadSetupState = async () => {
      // If no projectId, redirect back or show error
      if (!projectId) {
        setIsLoadingSetup(false);
        toast.error('No project selected. Please create a project first.');
        router.push('/dashboard');
        return;
      }

      try {
        setIsLoadingSetup(true);
        const setupState = await getProjectSetup(projectId);
        
        console.log('📥 Loaded setup state:', {
          status: setupState.status,
          last_step: setupState.last_step,
          projectId,
        });

        // If already completed, redirect to dashboard
        if (setupState.status === 'completed') {
          // Clear platform and step from localStorage if setup was already completed
          if (projectId && typeof window !== 'undefined') {
            localStorage.removeItem(`setup_platform_${projectId}`);
            localStorage.removeItem(`setup_step_${projectId}`);
          }
          toast.success('Project setup already completed');
          router.push('/dashboard');
          return;
        }

        // Resume from last step (steps are now 2-4, since project creation is separate)
        // Map old step 1 to step 2 (platform selection)
        let resumeStep: SetupStep = 2; // Default to step 2
        
        if (setupState.last_step && setupState.last_step >= 1 && setupState.last_step <= 4) {
          // If last_step was 1 (project creation), start at step 2 (platform)
          resumeStep = setupState.last_step === 1 ? 2 : setupState.last_step;
          console.log(`🔄 Resuming from backend step ${resumeStep} (last_step was ${setupState.last_step})`);
          
          // If we're on step 3 or 4, check if API key was already created
          if (setupState.last_step >= 3) {
            try {
              const keys = await getAPIKeys(projectId);
              // Get the most recent active key
              const activeKey = keys.find(k => k.status === 'active');
              if (activeKey) {
                // Note: We can't retrieve the full key value once created (security)
                // Set a flag to indicate key exists - user can proceed
                setApiKey('***API_KEY_EXISTS***');
              }
            } catch (error) {
              console.error('Failed to load API keys:', error);
            }
          }
          
          // If we're on step 4 and waiting for event, check if it's already completed
          if (setupState.last_step === 4) {
            if (setupState.first_event_seen_at) {
              setHasFirstEvent(true);
              setIsWaitingForEvent(false);
            } else {
              setIsWaitingForEvent(true);
            }
          }
        } else {
          // Fallback to localStorage if backend doesn't have last_step
          if (projectId && typeof window !== 'undefined') {
            const savedStep = localStorage.getItem(`setup_step_${projectId}`);
            if (savedStep) {
              const stepNum = parseInt(savedStep, 10);
              if (stepNum >= 2 && stepNum <= 4) {
                resumeStep = stepNum as SetupStep;
                console.log(`🔄 Resuming from localStorage step ${resumeStep}`);
                
                // If resuming from step 3 or 4, check if API key was already created
                if (stepNum >= 3) {
                  try {
                    const keys = await getAPIKeys(projectId);
                    const activeKey = keys.find(k => k.status === 'active');
                    if (activeKey) {
                      setApiKey('***API_KEY_EXISTS***');
                    }
                  } catch (error) {
                    console.error('Failed to load API keys:', error);
                  }
                }
              }
            }
          }
          
          // New project setup - start at step 2 (platform selection)
          if (resumeStep === 2) {
            console.log('🆕 No last_step found, starting fresh at step 2');
          }
        }
        
        setStep(resumeStep);
        
        // Restore platform from localStorage (if available)
        if (projectId && typeof window !== 'undefined') {
          const savedPlatform = localStorage.getItem(`setup_platform_${projectId}`);
          if (savedPlatform && ['web', 'ios', 'android', 'backend'].includes(savedPlatform)) {
            setPlatform(savedPlatform as Platform);
          }
        }
      } catch (error: any) {
        // If setup record doesn't exist (404/500), that's fine - start from step 1
        // Backend may return 500 if record doesn't exist yet, which is expected for new projects
        const errorMsg = String(error?.message || '');
        if (errorMsg.includes('404') || errorMsg.includes('500') || errorMsg.includes('not found')) {
          console.log('No setup state found, starting fresh');
        } else {
          console.error('Error loading setup state:', error);
        }
      } finally {
        setIsLoadingSetup(false);
      }
    };

    loadSetupState();
  }, [projectId, router, selectedProjectId, setSelectedProjectId]);

  // Restore platform from localStorage when projectId is available
  useEffect(() => {
    if (projectId && typeof window !== 'undefined') {
      const savedPlatform = localStorage.getItem(`setup_platform_${projectId}`);
      if (savedPlatform && ['web', 'ios', 'android', 'backend'].includes(savedPlatform)) {
        setPlatform(savedPlatform as Platform);
      }
    }
  }, [projectId]);

  // Save progress after each step
  const saveProgress = async (stepNumber: number, status: 'in_progress' | 'completed' = 'in_progress') => {
    if (!projectId) {
      console.warn('Cannot save progress: no projectId');
      return;
    }

    // Save to localStorage as backup (cleared when setup completes)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`setup_step_${projectId}`, String(stepNumber));
    }

    try {
      console.log(`💾 Saving progress: step ${stepNumber}, status: ${status}`);
      const result = await updateProjectSetup(projectId, status, stepNumber);
      console.log(`✅ Progress saved successfully:`, result);
    } catch (error: any) {
      console.error('❌ Failed to save progress:', error);
      // Don't silently fail - show error to user
      toast.error(`Failed to save progress: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleGenerateKey = async () => {
    if (!projectId) {
      toast.error('Project is not created yet');
      return;
    }
    setIsCreatingKey(true);
    try {
      const created = await createAPIKey(projectId, 'Default');
      setApiKey(created.apiKey);
      toast.success('API key created');
      // Stay on step 3 to show the key - don't advance to step 4 yet
      // Save progress: step 3 completed
      await saveProgress(3);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create API key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Poll setup state to detect first event (backend auto-detects and sets first_event_seen_at)
  useEffect(() => {
    if (!projectId || !isWaitingForEvent || hasFirstEvent) return;

    let intervalId: NodeJS.Timeout | null = null;

    const pollForEvent = async () => {
      try {
        const setupState = await getProjectSetup(projectId);
        
        // Debug: log setup state to help troubleshoot
        console.log('Polling setup state:', {
          projectId,
          first_event_seen_at: setupState.first_event_seen_at,
          status: setupState.status,
          last_step: setupState.last_step,
        });
        
        // Check if first event was detected by backend (primary method)
        if (setupState.first_event_seen_at) {
          console.log('✅ First event detected via setup state!', setupState.first_event_seen_at);
          setHasFirstEvent(true);
          setIsWaitingForEvent(false);
          // Mark setup as completed
          try {
            await updateProjectSetup(projectId, 'completed', 4);
            console.log('✅ Setup marked as completed');
            // Clear platform and step from localStorage when setup is completed
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`setup_platform_${projectId}`);
              localStorage.removeItem(`setup_step_${projectId}`);
            }
          } catch (error) {
            console.error('Failed to mark setup as completed:', error);
          }
          toast.success('We received your first event!');
          if (intervalId) {
            clearInterval(intervalId);
          }
          return;
        }
        
        // Fallback: Check events endpoint directly if backend hasn't set first_event_seen_at
        // This handles cases where backend auto-detection hasn't kicked in yet
        try {
          const eventsResponse = await getEvents(projectId, { limit: 1, offset: 0 });
          const events = Array.isArray(eventsResponse.events) ? eventsResponse.events : [];
          
          if (events.length > 0) {
            console.log('✅ First event found via events endpoint!', events[0]);
            // Event exists, but backend hasn't updated setup state yet
            // Manually mark setup as completed
            try {
              await updateProjectSetup(projectId, 'completed', 4);
              console.log('✅ Setup marked as completed manually');
              // Clear platform from localStorage when setup is completed
              if (typeof window !== 'undefined') {
                localStorage.removeItem(`setup_platform_${projectId}`);
              }
            } catch (error) {
              console.error('Failed to mark setup as completed:', error);
            }
            setHasFirstEvent(true);
            setIsWaitingForEvent(false);
            toast.success('We received your first event!');
            if (intervalId) {
              clearInterval(intervalId);
            }
            return;
          }
        } catch (eventsError) {
          // Events check failed, but that's okay - continue polling setup state
          console.log('Events endpoint check failed (non-critical):', eventsError);
        }
        
        console.log('⏳ Still waiting for first event...', {
          status: setupState.status,
          hasFirstEventSeenAt: !!setupState.first_event_seen_at,
        });
      } catch (error: any) {
        // Log error but keep polling; errors are likely transient
        console.error('❌ Error polling for first event:', {
          error: error?.message || error,
          projectId,
        });
      }
    };

    // Poll immediately, then every 2.5 seconds
    pollForEvent();
    intervalId = setInterval(pollForEvent, 2500);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [projectId, isWaitingForEvent, hasFirstEvent]);

  const handleGoToDashboard = async () => {
    if (projectId) {
      setSelectedProjectId(projectId);
      // Ensure setup is marked as completed
      try {
        await saveProgress(4, 'completed');
      } catch {
        // Ignore errors
      }
      // Clear platform and step from localStorage when setup is completed
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`setup_platform_${projectId}`);
        localStorage.removeItem(`setup_step_${projectId}`);
      }
    }
    router.push('/dashboard');
  };

  if (isLoadingSetup) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-24 lg:pb-28">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24 lg:pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2">Let&apos;s get your project ready</h1>
          <p className="text-gray-400">
            We&apos;ll help you set up your project: choose your platform, generate an API key, and verify your first event.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 space-y-4">
          <SetupStepItem
            step={2}
            current={step}
            title="Pick platform"
            description="Choose where you send data from"
            onClick={async () => {
              setStep(2);
              if (projectId) {
                await saveProgress(2);
              }
            }}
            canNavigate={true}
          />
          <SetupStepItem
            step={3}
            current={step}
            title="Generate API key"
            description="Secure key for your SDK"
            onClick={async () => {
              setStep(3);
              if (projectId) {
                await saveProgress(3);
              }
            }}
            canNavigate={true}
          />
          <SetupStepItem
            step={4}
            current={step}
            title="Send first event"
            description="Verify integration works"
            onClick={async () => {
              setStep(4);
              setIsWaitingForEvent(true);
              if (projectId) {
                await saveProgress(4);
              }
            }}
            canNavigate={true}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {step === 2 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Choose your platform</h2>
                <p className="text-sm text-gray-400">
                  We&apos;ll show you example SDK instructions for your stack. These are{' '}
                  <span className="font-semibold text-gray-200">dummy examples</span> until official
                  SDKs are published.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <PlatformPill
                  label="Web"
                  value="web"
                  current={platform}
                  icon={Globe}
                  onSelect={(value) => {
                    setPlatform(value);
                    // Save to localStorage (temporary, cleared when setup completes)
                    if (projectId && typeof window !== 'undefined') {
                      localStorage.setItem(`setup_platform_${projectId}`, value);
                    }
                  }}
                />
                <PlatformPill
                  label="iOS"
                  value="ios"
                  current={platform}
                  icon={Smartphone}
                  onSelect={(value) => {
                    setPlatform(value);
                    // Save to localStorage (temporary, cleared when setup completes)
                    if (projectId && typeof window !== 'undefined') {
                      localStorage.setItem(`setup_platform_${projectId}`, value);
                    }
                  }}
                />
                <PlatformPill
                  label="Android"
                  value="android"
                  current={platform}
                  icon={Smartphone}
                  onSelect={(value) => {
                    setPlatform(value);
                    // Save to localStorage (temporary, cleared when setup completes)
                    if (projectId && typeof window !== 'undefined') {
                      localStorage.setItem(`setup_platform_${projectId}`, value);
                    }
                  }}
                />
                <PlatformPill
                  label="Backend"
                  value="backend"
                  current={platform}
                  icon={Server}
                  onSelect={(value) => {
                    setPlatform(value);
                    // Save to localStorage (temporary, cleared when setup completes)
                    if (projectId && typeof window !== 'undefined') {
                      localStorage.setItem(`setup_platform_${projectId}`, value);
                    }
                  }}
                />
              </div>

              <DummySDKSnippet platform={platform} />

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="text-sm text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    // Save progress BEFORE moving to next step
                    if (projectId) {
                      await saveProgress(3); // Save step 3 (the step we're moving TO)
                    }
                    setStep(3);
                  }}
                  className="px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Generate your API key</h2>
                <p className="text-sm text-gray-400">
                  This key authenticates your SDK or backend when sending events to Norai.
                </p>
              </div>

              <div className="space-y-3">
                {apiKey && apiKey !== '***API_KEY_EXISTS***' ? (
                  <>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Your API key (copy it now)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey);
                          toast.success('API key copied');
                        }}
                        className="px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      You&apos;ll only see this key here once. Store it somewhere secure (e.g., env
                      vars).
                    </p>
                  </>
                ) : apiKey === '***API_KEY_EXISTS***' ? (
                  <>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-sm text-gray-300 mb-2">
                        API key already created for this project.
                      </p>
                      <p className="text-xs text-gray-500">
                        You can proceed to the next step. If you need a new key, you can create one from Settings.
                      </p>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateKey}
                    disabled={isCreatingKey || !projectId}
                    className="px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreatingKey ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      'Generate API key'
                    )}
                  </button>
                )}
              </div>

              <DummySDKSnippet platform={platform} apiKey={apiKey || '<your_api_key>'} />

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    // Save progress when going back
                    if (projectId) {
                      await saveProgress(2);
                    }
                    setStep(2);
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!apiKey && apiKey !== '***API_KEY_EXISTS***') {
                      toast.error('Generate an API key first');
                      return;
                    }
                    // Save progress BEFORE moving to next step
                    if (projectId) {
                      await saveProgress(4); // Save step 4 (the step we're moving TO)
                    }
                    setStep(4);
                    setIsWaitingForEvent(true);
                  }}
                  className="px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all cursor-pointer"
                  disabled={!apiKey}
                >
                  {apiKey === '***API_KEY_EXISTS***' ? 'Continue' : "I've added the key"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 space-y-6">
              {!hasFirstEvent ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Waiting for your first event…</h2>
                    <p className="text-sm text-gray-400">
                      Trigger an event from your app using the API key and snippet above. We&apos;ll
                      automatically detect it.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Listening for events from this project…</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tip: In development, you can send a test event with a simple <code
                      className="font-mono"
                    >
                      POST /v1/events
                    </code>{' '}
                    using your API key.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-green-400">
                        We&apos;ve received your first event!
                      </h2>
                      <p className="text-sm text-gray-400">
                        Norai is now connected to your app. You can explore analytics, funnels, and
                        journeys.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-sm text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsWaitingForEvent(true);
                          setHasFirstEvent(false);
                          if (projectId) {
                            await saveProgress(4);
                          }
                        }}
                        className="text-sm text-gray-400 hover:text-white transition-all cursor-pointer"
                      >
                        Listen again
                      </button>
                      <button
                        type="button"
                        onClick={handleGoToDashboard}
                        className="px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        Go to dashboard
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SetupStepItem({
  step,
  current,
  title,
  description,
  onClick,
  canNavigate = false,
}: {
  step: SetupStep;
  current: SetupStep;
  title: string;
  description: string;
  onClick?: () => void;
  canNavigate?: boolean;
}) {
  const isActive = current === step;
  const isCompleted = current > step;
  const canClick = canNavigate && (isCompleted || isActive || current >= step);
  
  return (
    <div
      onClick={canClick ? onClick : undefined}
      className={[
        'flex items-start gap-3 transition-all',
        canClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
      ].join(' ')}
    >
      <div
        className={[
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-all',
          isCompleted
            ? 'bg-green-500 text-black border-green-400'
            : isActive
            ? 'bg-white text-black border-white'
            : 'bg-black border-white/20 text-gray-400',
          canClick && !isActive ? 'hover:border-white/40' : '',
        ].join(' ')}
      >
        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step}
      </div>
      <div className="flex-1">
        <div className={[
          'text-sm font-medium transition-colors',
          isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-400',
        ].join(' ')}>{title}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
  );
}

function PlatformPill({
  label,
  value,
  current,
  icon: Icon,
  onSelect,
}: {
  label: string;
  value: Platform;
  current: Platform;
  icon: typeof Activity;
  onSelect: (v: Platform) => void;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all',
        isActive
          ? 'bg-white text-black border-white'
          : 'bg-black/40 text-gray-300 border-white/15 hover:bg-white/10',
      ].join(' ')}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </button>
  );
}

function DummySDKSnippet({ platform, apiKey }: { platform: Platform; apiKey?: string }) {
  let title = '';
  let install = '';
  let snippet = '';
  let snippetLang: string = 'javascript';

  const keyLine = apiKey ? `apiKey: "${apiKey}",` : 'apiKey: "<your_api_key>",';

  switch (platform) {
    case 'web':
      title = 'Web (JavaScript) – dummy SDK example';
      install = 'npm install @norai/web-sdk   # DUMMY PACKAGE NAME';
      snippet = `import { createClient } from '@norai/web-sdk'; // dummy import\n\nconst client = createClient({\n  ${keyLine}\n  projectId: '<your_project_id>',\n});\n\nclient.track('signup_started', {\n  source: 'web',\n  plan: 'pro',\n});`;
      snippetLang = 'javascript';
      break;
    case 'ios':
      title = 'iOS (Swift) – dummy SDK example';
      install = 'Swift Package Manager → https://github.com/norai/norai-ios-sdk   # placeholder';
      snippet = `import NoraiSDK // dummy import\n\nlet client = NoraiClient(config: NoraiConfig(\n  apiKey: "${apiKey || "<your_api_key>"}",\n  projectId: "<your_project_id>"\n))\n\nclient.track(name: "signup_started", properties: [\n  "source": "ios",\n  "plan": "pro",\n])`;
      snippetLang = 'swift';
      break;
    case 'android':
      title = 'Android (Kotlin) – dummy SDK example';
      install = "implementation 'dev.norai:norai-android-sdk:0.0.1'   // placeholder";
      snippet = `val client = NoraiClient(\n  apiKey = "${apiKey || "<your_api_key>"}",\n  projectId = "<your_project_id>"\n)\n\nclient.track(\n  eventType = "signup_started",\n  properties = mapOf(\n    "source" to "android",\n    "plan" to "pro"\n  )\n)`;
      snippetLang = 'kotlin';
      break;
    case 'backend':
    default:
      title = 'Backend (Node.js) – dummy SDK example';
      install = 'npm install @norai/server-sdk   # DUMMY PACKAGE NAME';
      snippet = `import { NoraiClient } from '@norai/server-sdk'; // dummy import\n\nconst client = new NoraiClient({\n  ${keyLine}\n  projectId: '<your_project_id>',\n});\n\nawait client.track({\n  event_type: 'signup_started',\n  properties: {\n    source: 'backend',\n    plan: 'pro',\n  },\n});`;
      snippetLang = 'javascript';
      break;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-white">{title}</div>
          <div className="text-[11px] text-gray-500">
            These instructions are <span className="font-semibold">dummy</span> and for preview
            only.
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-white/10 text-gray-300 border border-white/10">
          Dummy example
        </span>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-2">
        <p className="text-[11px] text-gray-400">Install (placeholder):</p>
        <div className="[&_.syntax-highlighter]:!text-[11px] [&_.syntax-highlighter_pre]:!text-[11px] [&_.syntax-highlighter_code]:!text-[11px] [&_.syntax-highlighter]:!p-0 [&_.syntax-highlighter_pre]:!p-0 [&_.syntax-highlighter]:!m-0 [&_.syntax-highlighter_pre]:!m-0">
          <CodeHighlighter
            code={install}
            language="bash"
            customStyle={{
              backgroundColor: 'transparent',
              padding: '0',
              margin: '0',
              borderRadius: '0',
              fontSize: '11px',
              lineHeight: '1.4',
            }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Send an event (placeholder):</p>
        <div className="[&_.syntax-highlighter]:!text-[11px] [&_.syntax-highlighter_pre]:!text-[11px] [&_.syntax-highlighter_code]:!text-[11px] [&_.syntax-highlighter]:!p-0 [&_.syntax-highlighter_pre]:!p-0 [&_.syntax-highlighter]:!m-0 [&_.syntax-highlighter_pre]:!m-0">
          <CodeHighlighter
            code={snippet}
            language={snippetLang}
            customStyle={{
              backgroundColor: 'transparent',
              padding: '0',
              margin: '0',
              borderRadius: '0',
              fontSize: '11px',
              lineHeight: '1.4',
            }}
          />
        </div>
      </div>
    </div>
  );
}

