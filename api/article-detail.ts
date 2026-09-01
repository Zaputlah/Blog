import { isArticleSource, loadIslamicArticleDetail } from '../src/articles.js';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const source = url.searchParams.get('source') || '';
  const id = url.searchParams.get('id') || '';
  if (!isArticleSource(source) || !/^[A-Za-z0-9+/=_-]{8,1200}$/.test(id)) {
    return Response.json({ code: 'INVALID_ARTICLE' }, { status: 400 });
  }

  try {
    const article = await loadIslamicArticleDetail(source, id);
    return Response.json(
      { data: article },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'Vercel-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('Gagal memuat detail artikel:', error instanceof Error ? error.message : '');
    return Response.json({ code: 'ARTICLE_DETAIL_UNAVAILABLE' }, { status: 502 });
  }
}
