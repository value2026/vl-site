/**
 * Shared guest registration and profile options, validation patterns, and field styles.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+\d\s()-]{7,24}$/;
export const OTP_REGEX = /^\d{6}$/;

export const AGE_GROUPS = [
  '0 - 15',
  '16 - 20',
  '21 - 25',
  '26 - 30',
  '31 - 35',
  '36 - 40',
  '41 - 45',
  '46 - 50',
  'Above 50',
];

export const GENDERS = ['Male', 'Female'];
export const PROFESSIONS = ['Student', 'Academician', 'Others'];

export const CONTROL_BASE =
  'w-full bg-slate-50/80 border rounded-xl px-3.5 py-2 text-base sm:text-[15px] text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800 transition-all min-h-[44px]';
export const CONTROL_OK = 'border-slate-300 focus:ring-primary-500/20 focus:border-primary-700';
export const CONTROL_ERR = 'border-red-500 bg-red-50/40 focus:ring-red-500/20 focus:border-red-600';

export const buildDescribedBy = (helpId, errId, hasError) => {
  const ids = [];
  if (helpId) ids.push(helpId);
  if (hasError && errId) ids.push(errId);
  return ids.length ? ids.join(' ') : undefined;
};

