const HADITS_API_URL = 'https://service.hadis.my/api/v1/hadis/random';
const HADITS_SEARCH_API_URL = 'https://service.hadis.my/api/v1/hadis/search';
const HADITS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const HADITS_SEARCH_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface DailyHadits {
  id: number;
  collection: string;
  arab: string;
  indonesia: string;
}

interface HaditsApiResponse {
  success?: boolean;
  data?: { hadis?: DailyHadits[] };
}

interface HaditsSearchApiResponse {
  success?: boolean;
  data?: { results?: DailyHadits[] };
}

let haditsCache: { expiresAt: number; items: DailyHadits[] } | null = null;
let pendingHaditsRequest: Promise<DailyHadits[]> | null = null;
const searchCache = new Map<string, { expiresAt: number; items: DailyHadits[] }>();
const pendingSearchRequests = new Map<string, Promise<DailyHadits[]>>();

export function getHaditsCacheExpiry(): number | null {
  return haditsCache?.expiresAt || null;
}

export async function loadDailyHadits(): Promise<DailyHadits[]> {
  if (haditsCache && haditsCache.expiresAt > Date.now()) return haditsCache.items;

  if (pendingHaditsRequest) return pendingHaditsRequest;
  pendingHaditsRequest = refreshDailyHadits();
  try {
    return await pendingHaditsRequest;
  } finally {
    pendingHaditsRequest = null;
  }
}

async function refreshDailyHadits(): Promise<DailyHadits[]> {

  const apiKey = process.env['HADITS_API_KEY'];
  if (!apiKey) throw new Error('HADITS_API_KEY_MISSING');

  try {
    const url = new URL(HADITS_API_URL);
    url.searchParams.set('count', '10');
    url.searchParams.set('lang', 'id');

    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) throw new Error(`HADITS_API_${response.status}`);
    const result = (await response.json()) as HaditsApiResponse;
    const items = Array.isArray(result.data?.hadis) ? result.data.hadis : [];
    if (!result.success || !items.length) throw new Error('HADITS_API_EMPTY');

    haditsCache = {
      items,
      expiresAt: Date.now() + HADITS_CACHE_TTL_MS,
    };
    return items;
  } catch (error) {
    // Tetap sajikan data lama bila upstream sedang bermasalah atau kuota habis.
    if (haditsCache?.items.length) return haditsCache.items;
    throw error;
  }
}

export async function searchHadits(query: string): Promise<DailyHadits[]> {
  const cached = searchCache.get(query);
  if (cached && cached.expiresAt > Date.now()) return cached.items;

  const pending = pendingSearchRequests.get(query);
  if (pending) return pending;

  const request = requestHaditsSearch(query);
  pendingSearchRequests.set(query, request);
  try {
    return await request;
  } finally {
    pendingSearchRequests.delete(query);
  }
}

async function requestHaditsSearch(query: string): Promise<DailyHadits[]> {
  const apiKey = process.env['HADITS_API_KEY'];
  if (!apiKey) throw new Error('HADITS_API_KEY_MISSING');

  const url = new URL(HADITS_SEARCH_API_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('lang', 'id');
  url.searchParams.set('per_page', '10');

  const response = await fetch(url, {
    headers: { 'X-API-Key': apiKey },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`HADITS_API_${response.status}`);

  const result = (await response.json()) as HaditsSearchApiResponse;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  if (!result.success) throw new Error('HADITS_API_ERROR');

  if (searchCache.size >= 100) {
    const oldestKey = searchCache.keys().next().value as string | undefined;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  searchCache.set(query, {
    items,
    expiresAt: Date.now() + HADITS_SEARCH_CACHE_TTL_MS,
  });
  return items;
}
