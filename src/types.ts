export type LinkStatus = 'active' | 'expired' | 'limit_reached' | 'paused';

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'bot';

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface ABVariant {
  id: string;
  url: string;
  weight: number; // e.g. 50
  clicks: number;
}

export interface ABTestConfig {
  enabled: boolean;
  variants: ABVariant[];
}

export interface LinkHealth {
  status: 'healthy' | 'warning' | 'error' | 'unchecked';
  lastChecked?: string;
  statusCode?: number;
  destinationTitle?: string;
  destinationFavicon?: string;
}

export interface SocialPreviewMeta {
  title?: string;
  description?: string;
  image?: string;
}

export interface LinkItem {
  id: string;
  code: string;
  url: string;
  title: string;
  clicks: number;
  createdAt: string;
  lastVisitedAt: string | null;
  // Feature 1: Link Expiry & Click Limits
  expiresAt: string | null;
  maxClicks: number | null;
  status: LinkStatus;
  // Feature 3: Organization
  folderId: string | null;
  tags: string[];
  campaignId: string | null;
  // New Features
  password: string | null;
  utmParams?: UTMParams;
  abTest?: ABTestConfig;
  healthStatus?: LinkHealth;
  socialPreview?: SocialPreviewMeta;
  notes?: string;
  shortUrl?: string;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  code: string;
  createdAt: string;
  referrer: string;
  referrerDomain: string;
  userAgent: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  country: string;
  countryCode: string;
  city: string;
  ip: string;
  variantId?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  utmCampaign: string;
  targetClicks?: number;
  startDate?: string;
  endDate?: string;
  color: string;
  createdAt: string;
}

export interface BioLinkItem {
  id: string;
  title: string;
  url: string;
  clicks: number;
  icon?: string;
  subtitle?: string;
}

export interface BioPage {
  id: string;
  slug: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  theme: 'slate' | 'neon' | 'sunset' | 'emerald' | 'violet';
  socialLinks: { platform: string; url: string }[];
  links: BioLinkItem[];
  totalViews: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  limitReachedLinks: number;
  totalClicks: number;
  todayClicks: number;
  yesterdayClicks: number;
  weekClicks: number;
  monthClicks: number;
  devices: { name: string; count: number; percentage: number }[];
  browsers: { name: string; count: number; percentage: number }[];
  operatingSystems: { name: string; count: number; percentage: number }[];
  countries: { code: string; name: string; count: number; percentage: number }[];
  topReferrers: { domain: string; count: number; percentage: number }[];
  clicksByDay: { date: string; label: string; clicks: number }[];
  hourlyTrend: { hour: number; label: string; clicks: number }[];
}
