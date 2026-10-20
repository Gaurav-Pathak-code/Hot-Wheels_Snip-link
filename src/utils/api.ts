import type {
  LinkItem,
  ClickEvent,
  Folder,
  Campaign,
  BioPage,
  AnalyticsSummary,
} from '../types.js';

export async function fetchLinks(params?: {
  search?: string;
  folderId?: string;
  campaignId?: string;
  tag?: string;
  status?: string;
}): Promise<LinkItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.folderId) query.set('folderId', params.folderId);
  if (params?.campaignId) query.set('campaignId', params.campaignId);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.status) query.set('status', params.status);

  const res = await fetch(`/api/links?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load links');
  const data = await res.json();
  return data.links;
}

export async function fetchLinkDetails(code: string): Promise<{ link: LinkItem; clicks: ClickEvent[] }> {
  const res = await fetch(`/api/links/${encodeURIComponent(code)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load link details');
  }
  return res.json();
}

export async function createShortLink(payload: {
  url: string;
  code?: string;
  slug?: string;
  title?: string;
  expiresAt?: string | null;
  maxClicks?: number | null;
  folderId?: string | null;
  tags?: string[];
  campaignId?: string | null;
  password?: string | null;
  utmParams?: any;
  abTest?: any;
  notes?: string;
}): Promise<LinkItem> {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create link');
  return data.link;
}

export async function updateLink(code: string, updates: Partial<LinkItem>): Promise<LinkItem> {
  const res = await fetch(`/api/links/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update link');
  return data.link;
}

export async function deleteLink(code: string): Promise<void> {
  const res = await fetch(`/api/links/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete link');
  }
}

export async function triggerTestClick(
  code: string,
  params: { deviceType?: string; browser?: string; os?: string; country?: string; referrer?: string }
) {
  const res = await fetch(`/api/links/${encodeURIComponent(code)}/test-click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to register test click');
  return data;
}

export async function checkLinkHealth(url: string): Promise<{
  healthy: boolean;
  statusCode: number;
  latencyMs?: number;
  title?: string;
  error?: string;
}> {
  const res = await fetch('/api/links/check-health', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch('/api/analytics');
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

export async function fetchFolders(): Promise<Folder[]> {
  const res = await fetch('/api/folders');
  if (!res.ok) throw new Error('Failed to load folders');
  const data = await res.json();
  return data.folders;
}

export async function createFolder(payload: { name: string; color?: string; icon?: string; description?: string }): Promise<Folder> {
  const res = await fetch('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create folder');
  return data.folder;
}

export async function deleteFolder(id: string): Promise<void> {
  const res = await fetch(`/api/folders/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete folder');
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch('/api/campaigns');
  if (!res.ok) throw new Error('Failed to load campaigns');
  const data = await res.json();
  return data.campaigns;
}

export async function createCampaign(payload: {
  name: string;
  description?: string;
  utmCampaign: string;
  targetClicks?: number;
  startDate?: string;
  endDate?: string;
  color?: string;
}): Promise<Campaign> {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
  return data.campaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete campaign');
}

export async function fetchBioPages(): Promise<BioPage[]> {
  const res = await fetch('/api/bio-pages');
  if (!res.ok) throw new Error('Failed to load bio pages');
  const data = await res.json();
  return data.bioPages;
}

export async function saveBioPage(page: BioPage): Promise<BioPage> {
  const res = await fetch('/api/bio-pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save bio page');
  return data.bioPage;
}
