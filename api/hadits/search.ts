import { createHash } from 'node:crypto';
import { searchHadits } from '../../src/hadits.js';

const SEARCH_LIMIT = 2;
const searchUsage = new Map<string, number>();
let usageDate = currentDate();

const successHeaders = {
  'Cache-Control': 'public, max-age=86400',
  'CDN-Cache-Control': 'public, max-age=2592000, stale-while-revalidate=2592000',
  'Vercel-CDN-Cache-Control': 'public, max-age=2592000, stale-while-revalidate=2592000',
};

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get('q') || '';
  const query = normalizeQuery(rawQuery);

  if (query.length < 3 || query.length > 60) {
    return Response.json(
      { code: 'INVALID_QUERY', message: 'Kata kunci harus terdiri dari 3–60 karakter.' },
      { status: 400 },
    );
  }

  if (rawQuery !== query || url.searchParams.size !== 1) {
    url.search = '';
    url.searchParams.set('q', query);
    return Response.redirect(url, 308);
  }

  const identity = anonymousIdentity(request);
  if (!takeSearchSlot(identity)) {
    return Response.json(
      {
        code: 'DAILY_SEARCH_LIMIT',
        message: 'Batas 2 pencarian baru hari ini sudah tercapai.',
      },
      { status: 429 },
    );
  }

  try {
    const items = await searchHadits(query);
    return Response.json({ data: items, query }, { headers: successHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    console.error('Gagal mencari hadis:', message);
    return Response.json(
      {
        code: message === 'HADITS_API_KEY_MISSING' ? message : 'HADITS_SEARCH_ERROR',
        message: 'Pencarian hadis belum dapat digunakan.',
      },
      { status: message === 'HADITS_API_429' ? 429 : 502 },
    );
  }
}

function normalizeQuery(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('id-ID').replace(/\s+/g, ' ');
}

function anonymousIdentity(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || request.headers.get('x-real-ip') || 'unknown';
  const secret = process.env['HADITS_API_KEY'] || 'hadits-search';
  return createHash('sha256').update(`${currentDate()}:${ip}:${secret}`).digest('hex');
}

function takeSearchSlot(identity: string): boolean {
  const today = currentDate();
  if (usageDate !== today) {
    usageDate = today;
    searchUsage.clear();
  }

  const used = searchUsage.get(identity) || 0;
  if (used >= SEARCH_LIMIT) return false;
  searchUsage.set(identity, used + 1);
  return true;
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}
