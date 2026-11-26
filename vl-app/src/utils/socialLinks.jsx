import { Globe } from 'lucide-react';

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'facebook',  label: 'Facebook' },
  { value: 'twitter',   label: 'X (Twitter)' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'github',    label: 'GitHub' },
  { value: 'whatsapp',  label: 'WhatsApp' },
  { value: 'telegram',  label: 'Telegram' },
  { value: 'website',   label: 'Website / Other' },
];

export const DEFAULT_SOCIAL_LINKS = [
  { platform: 'facebook',  label: 'Facebook',    href: 'https://www.facebook.com' },
  { platform: 'twitter',   label: 'X (Twitter)', href: 'https://x.com' },
  { platform: 'youtube',   label: 'YouTube',     href: 'https://www.youtube.com' },
  { platform: 'linkedin',  label: 'LinkedIn',    href: 'https://www.linkedin.com' },
  { platform: 'instagram', label: 'Instagram',   href: 'https://www.instagram.com' },
];

export function normalizeSocialUrl(href) {
  if (!href || typeof href !== 'string') return '';
  const trimmed = href.trim();
  if (!trimmed || trimmed === '#') return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getSocialHoverClasses(platform) {
  switch ((platform || '').toLowerCase()) {
    case 'facebook':
      return 'hover:border-[#1877F2]/60 hover:bg-[#1877F2]/15 hover:text-[#60A5FA]';
    case 'twitter':
    case 'x':
      return 'hover:border-slate-400/60 hover:bg-white/10 hover:text-white';
    case 'youtube':
      return 'hover:border-[#FF0000]/60 hover:bg-[#FF0000]/15 hover:text-[#F87171]';
    case 'linkedin':
      return 'hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/15 hover:text-[#60A5FA]';
    case 'instagram':
      return 'hover:border-[#E4405F]/60 hover:bg-[#E4405F]/15 hover:text-[#F472B6]';
    case 'github':
      return 'hover:border-slate-400/60 hover:bg-white/10 hover:text-white';
    case 'whatsapp':
      return 'hover:border-[#25D366]/60 hover:bg-[#25D366]/15 hover:text-[#4ADE80]';
    case 'telegram':
      return 'hover:border-[#26A5E4]/60 hover:bg-[#26A5E4]/15 hover:text-[#38BDF8]';
    default:
      return 'hover:border-slate-500 hover:bg-white/10 hover:text-white';
  }
}

export function SocialIcon({ platform, className = 'w-4 h-4' }) {
  switch ((platform || '').toLowerCase()) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.4H7.5v3.2h2.7V21h3.3z" />
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.8 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.5-.2-1-.4-1.8-.7-3.1-1.3-5.1-4.5-5.3-4.7-.1-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.5.3.6.9 2.2 1 2.4.1.2.1.4 0 .6-.1.2-.2.4-.3.5l-.4.5c-.2.2-.3.3-.1.6.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.8 1.7.3.1.5.1.7-.1.2-.2.8-.9 1-1.3.2-.3.4-.3.7-.2.3.1 1.9.9 2.2 1.1.3.2.6.2.7.4.1.2.1.9-.1 1.6z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M21.9 4.6c.3-1.2-.5-1.7-1.5-1.3L2.8 10.1c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 10.5-6.6c.5-.3.9-.1.6.2l-8.5 7.7-.3 4.7c.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l2.8-13.4z" />
        </svg>
      );
    default:
      return <Globe className={className} strokeWidth={1.6} />;
  }
}

