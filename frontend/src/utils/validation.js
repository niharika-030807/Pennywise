/**
 * Form input validation utilities.
 */

export function isValidPhone(phone) {
  const clean = String(phone || '').replace(/\D/g, '');
  return clean.length === 10;
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email || '').trim().toLowerCase());
}

export function calculatePasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: 'None', color: 'bg-gray-600' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
  if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
  return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
}
