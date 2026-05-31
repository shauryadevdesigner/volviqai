export const ROLE_OPTIONS = [
  'Creator',
  'Video Editor',
  'Developer',
  'Agency',
  'Business Owner',
  'Other',
] as const;

export type RoleOption = (typeof ROLE_OPTIONS)[number];

export interface EarlyAccessFormData {
  fullName: string;
  email: string;
  company: string;
  role: RoleOption | '';
}

export interface EarlyAccessUserRow {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  role: string | null;
  created_at: string;
}

export interface FormFieldErrors {
  fullName?: string;
  email?: string;
  company?: string;
  role?: string;
  form?: string;
}
