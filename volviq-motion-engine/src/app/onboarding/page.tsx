"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import ClickSpark from '@/components/animations/ClickSpark';
import BlurText from '@/components/animations/BlurText';
import GlareHover from '@/components/animations/GlareHover';
import Telemetry from '@/components/Telemetry';
import AuthNavbar from '@/components/auth/AuthNavbar';
import ProgressBar from '@/components/onboarding/ProgressBar';
import OnboardingStep from '@/components/onboarding/OnboardingStep';
import OptionChip from '@/components/onboarding/OptionChip';
import { useAuthContext } from '@/components/providers/AuthProvider';
import {
  completeOnboarding,
  getSupabase,
} from '@/lib/supabase';
import {
  BUSINESS_TYPES,
  PLATFORMS,
  PRIMARY_GOALS,
} from '@/types/profile';

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const { session, profile, loading } = useAuthContext();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [businessType, setBusinessType] = useState('');
  const [platform, setPlatform] = useState('');

  // Redirect if not authenticated, or if onboarding is already completed
  useEffect(() => {
    if (!loading) {
      if (!session) {
        router.push('/login');
      } else if (profile?.onboarding_completed_at) {
        router.push('/dashboard');
      }
    }
  }, [session, profile, loading, router]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const validateStep = async (): Promise<boolean> => {
    setError(null);
    if (step === 1) {
      if (!username.trim() || !displayName.trim()) {
        setError('Please fill in username and display name.');
        return false;
      }
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
        setError('Username must be 3–24 characters (letters, numbers, underscore).');
        return false;
      }
      try {
        const enteredUsername = username.trim().toLowerCase();
        const supabase = getSupabase();
        const { data, error: usernameError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', enteredUsername)
          .maybeSingle();

        if (usernameError) {
          setError('Could not verify username. Try again.');
          return false;
        }

        const isAvailable = !data;
        if (!isAvailable) {
          setError('Username is already taken');
          return false;
        }
      } catch {
        setError('Could not verify username. Try again.');
        return false;
      }
    }
    if (step === 2 && goals.length === 0) {
      setError('Select at least one goal.');
      return false;
    }
    if (step === 3 && !businessType) {
      setError('Select who you are creating for.');
      return false;
    }
    if (step === 4 && !platform) {
      setError('Select a primary platform.');
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    const ok = await validateStep();
    if (!ok) return;

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    setSubmitLoading(true);
    try {
      await completeOnboarding(session.user.id, {
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        goals,
        business_type: businessType,
        platform,
      });
      // Force page reload to sync profile data in AuthProvider
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save onboarding.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ClickSpark sparkColor="#ffffff" sparkSize={10} sparkRadius={18} sparkCount={6} duration={400}>
      <div className="relative min-h-screen bg-surface">
        <Telemetry />
        <AuthNavbar />
        <div className="scanline" aria-hidden="true" />

        <section className="flex min-h-screen flex-col items-center justify-center px-margin-mobile py-24 md:px-margin-desktop">
          <h1 className="mb-10 max-w-xl text-center font-display-massive text-[28px] text-primary sm:text-[40px]">
            <BlurText text="PERSONALIZE YOUR WORKSPACE" animateBy="words" delay={60} className="justify-center text-primary" />
          </h1>

          <GlareHover className="w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container-low/90 p-8 backdrop-blur-md md:p-10">
            <ProgressBar step={step} total={TOTAL_STEPS} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <OnboardingStep
                  key="step1"
                  title="Welcome to Volviq AI"
                  subtitle="Let's personalize your creative workspace."
                >
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                        Username
                      </label>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary"
                        placeholder="shaurya"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                        Display name
                      </label>
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary"
                        placeholder="Shaurya"
                      />
                    </div>
                  </div>
                </OnboardingStep>
              )}

              {step === 2 && (
                <OnboardingStep
                  key="step2"
                  title="What do you primarily want to create?"
                  subtitle="Select all that apply."
                >
                  <div className="flex flex-wrap gap-2">
                    {PRIMARY_GOALS.map((g) => (
                      <OptionChip
                        key={g}
                        label={g}
                        selected={goals.includes(g)}
                        onClick={() => toggleGoal(g)}
                      />
                    ))}
                  </div>
                </OnboardingStep>
              )}

              {step === 3 && (
                <OnboardingStep key="step3" title="Who are you creating for?">
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_TYPES.map((b) => (
                      <OptionChip
                        key={b}
                        label={b}
                        selected={businessType === b}
                        onClick={() => setBusinessType(b)}
                      />
                    ))}
                  </div>
                </OnboardingStep>
              )}

              {step === 4 && (
                <OnboardingStep key="step4" title="Where will you publish most content?">
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <OptionChip
                        key={p}
                        label={p}
                        selected={platform === p}
                        onClick={() => setPlatform(p)}
                      />
                    ))}
                  </div>
                </OnboardingStep>
              )}
            </AnimatePresence>

            {error && (
              <p className="mt-4 text-sm text-error" role="alert">
                {error}
              </p>
            )}

            <div className="mt-8 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 border border-outline-variant py-3 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:border-primary hover:text-primary"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleContinue}
                disabled={submitLoading}
                className="flex-1 bg-primary py-3 font-label-md text-label-md uppercase tracking-widest text-surface hover:opacity-90 disabled:opacity-50"
              >
                {submitLoading ? 'Saving…' : step === TOTAL_STEPS ? 'Complete Setup' : 'Continue'}
              </button>
            </div>
          </GlareHover>
        </section>
      </div>
    </ClickSpark>
  );
}
