import { getHaditsCacheExpiry, loadDailyHadits } from '../../src/hadits.js';

const successHeaders = {
  'Cache-Control': 'public, max-age=3600',
  'CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
  'Vercel-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
};

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.search) {
    url.search = '';
    return Response.redirect(url, 308);
  }

  try {
    const items = await loadDailyHadits();
    return Response.json(
      { data: items, cachedUntil: getHaditsCacheExpiry() },
      { headers: successHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'HADITS_API_KEY_MISSING') {
      return Response.json(
        {
          code: 'HADITS_API_KEY_MISSING',
          message: 'Hadits API belum dikonfigurasi di server.',
        },
        { status: 503 },
      );
    }

    console.error('Gagal memuat hadis:', message);
    return Response.json(
      { code: message.startsWith('HADITS_API_') ? message : 'HADITS_API_ERROR' },
      { status: message === 'HADITS_API_429' ? 429 : 502 },
    );
  }
}
