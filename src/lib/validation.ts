import type { EarlyAccessFormData, FormFieldErrors, RoleOption } from '../types/earlyAccess';
import { ROLE_OPTIONS } from '../types/earlyAccess';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEarlyAccessForm(data: EarlyAccessFormData): FormFieldErrors {
  const errors: FormFieldErrors = {};

  const fullName = data.fullName.trim();
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  } else if (fullName.length > 120) {
    errors.fullName = 'Name must be 120 characters or fewer.';
  }

  const email = data.email.trim().toLowerCase();
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  } else if (email.length > 254) {
    errors.email = 'Email must be 254 characters or fewer.';
  }

  if (data.company.trim().length > 150) {
    errors.company = 'Company name must be 150 characters or fewer.';
  }

  if (data.role && !ROLE_OPTIONS.includes(data.role as RoleOption)) {
    errors.role = 'Please select a valid role.';
  }

  return errors;
}

export function hasValidationErrors(errors: FormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function normalizeFormData(data: EarlyAccessFormData) {
  return {
    full_name: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    company: data.company.trim() || null,
    role: data.role || null,
  };
}
