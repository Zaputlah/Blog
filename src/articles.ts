const API_BASE = 'https://artikel-islam.netlify.app/.netlify/functions/api';
const LIST_CACHE_MS = 30 * 60 * 1000;
const DETAIL_CACHE_MS = 60 * 60 * 1000;

export const ARTICLE_SOURCES = {
  ks: 'KonsultasiSyariah.com',
  ms: 'Muslim.or.id',
  msh: 'Muslimah.or.id',
  cs: 'Cintasunnah.com',
  fir: 'Firanda.com',
  kj: 'Khotbahjumat.com',
  maf: 'Muslimafiyah.com',
  rum: 'Rumaysho.com',
} as const;

export type ArticleSourceCode = keyof typeof ARTICLE_SOURCES;

export interface IslamicArticleSummary {
  id: string;
  title: string;
  date: string;
  dateTime: string;
  author: string;
  url: string;
  source: string;
  sourceCode: ArticleSourceCode;
  categories: string[];
}

export interface IslamicArticleDetail extends IslamicArticleSummary {
  thumbnail: string;
  contentHtml: string;
}

interface UpstreamListResponse {
  success?: boolean;
  data?: {
    data?: unknown[];
  };
}

interface UpstreamDetailResponse {
  success?: boolean;
  data?: Record<string, unknown>;
}

let listCache: { expiresAt: number; data: IslamicArticleSummary[] } | null = null;
const detailCache = new Map<string, { expiresAt: number; data: IslamicArticleDetail }>();

export function isArticleSource(value: string): value is ArticleSourceCode {
  return Object.hasOwn(ARTICLE_SOURCES, value);
}

export async function loadIslamicArticles(): Promise<IslamicArticleSummary[]> {
  if (listCache && listCache.expiresAt > Date.now()) return listCache.data;

  const results = await Promise.allSettled(
    (Object.keys(ARTICLE_SOURCES) as ArticleSourceCode[]).map(async (sourceCode) => {
      const response = await fetchJson<UpstreamListResponse>(`${API_BASE}/${sourceCode}?page=1`);
      return (response.data?.data || [])
        .map((item) => normalizeSummary(item, sourceCode))
        .filter((item): item is IslamicArticleSummary => item !== null);
    }),
  );

  const articles = results
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .sort((left, right) => parseDate(right.dateTime) - parseDate(left.dateTime));

  if (!articles.length) throw new Error('ARTICLE_API_UNAVAILABLE');

  listCache = { expiresAt: Date.now() + LIST_CACHE_MS, data: articles };
  return articles;
}

export async function loadIslamicArticleDetail(
  sourceCode: ArticleSourceCode,
  id: string,
): Promise<IslamicArticleDetail> {
  const cacheKey = `${sourceCode}:${id}`;
  const cached = detailCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const response = await fetchJson<UpstreamDetailResponse>(
    `${API_BASE}/${sourceCode}/detail/${encodeURIComponent(id)}`,
  );
  const detail = normalizeDetail(response.data, sourceCode, id);
  if (!detail) throw new Error('ARTICLE_DETAIL_INVALID');

  detailCache.set(cacheKey, { expiresAt: Date.now() + DETAIL_CACHE_MS, data: detail });
  return detail;
}

function normalizeSummary(value: unknown, sourceCode: ArticleSourceCode): IslamicArticleSummary | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const id = asText(item['id']);
  const title = asText(item['title']);
  if (!id || !title) return null;

  return {
    id,
    title,
    date: asText(item['date']).trim(),
    dateTime: asText(item['date_time']),
    author: asText(item['author']),
    url: safeHttpUrl(item['url']),
    source: asText(item['type']) || ARTICLE_SOURCES[sourceCode],
    sourceCode,
    categories: asStringArray(item['categories']),
  };
}

function normalizeDetail(
  value: Record<string, unknown> | undefined,
  sourceCode: ArticleSourceCode,
  fallbackId: string,
): IslamicArticleDetail | null {
  if (!value) return null;
  const summary = normalizeSummary({ ...value, id: asText(value['id']) || fallbackId }, sourceCode);
  const contentHtml = asText(value['content_html']);
  if (!summary || !contentHtml) return null;

  return {
    ...summary,
    thumbnail: safeHttpUrl(value['thumbnail']),
    contentHtml,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`ARTICLE_API_${response.status}`);
  return (await response.json()) as T;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function safeHttpUrl(value: unknown): string {
  const text = asText(value);
  try {
    const url = new URL(text);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function parseDate(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}
