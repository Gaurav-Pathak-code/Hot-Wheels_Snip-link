/**
 * Helper to ensure links always resolve to the real live public URL
 * (e.g. https://ais-dev-...run.app/r/:code or https://yourapp.vercel.app/r/:code)
 * and never fallback to localhost in copy buttons, QR codes, or share links.
 */
export function getLiveShortUrl(code: string, serverShortUrl?: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    // If the browser is on a live cloud domain, always prefer the live browser origin
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return `${origin}/r/${code}`;
    }
  }

  if (serverShortUrl && !serverShortUrl.includes('localhost') && !serverShortUrl.includes('127.0.0.1')) {
    return serverShortUrl;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/r/${code}`;
  }

  return `/r/${code}`;
}

export function getCleanDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || url;
  }
}
