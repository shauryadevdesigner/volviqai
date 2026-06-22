export type PlanTier = 'free' | 'pro' | 'business';

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  goals: string[];
  business_type: string | null;
  platform: string | null;
  onboarding_completed_at: string | null;
  plan: PlanTier;
  generations_used_this_month: number;
  billing_period_start: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  username: string;
  display_name: string;
  goals: string[];
  business_type: string;
  platform: string;
}

export const PRIMARY_GOALS = [
  'Motion Graphic Ads',
  'Product Advertisements',
  'Instagram Reels',
  'YouTube Shorts',
  'Brand Campaigns',
  'Social Media Content',
  'Marketing Assets',
] as const;

export const BUSINESS_TYPES = [
  'My Own Business',
  'Startup',
  'E-commerce Brand',
  'Agency Clients',
  'Personal Brand',
  'Education',
] as const;

export const PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Facebook',
  'LinkedIn',
] as const;
