import { loadIslamicArticles } from '../../src/articles.js';

export async function GET(): Promise<Response> {
  try {
    const articles = await loadIslamicArticles();
    return Response.json(
      { data: articles },
      {
        headers: {
          'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
          'Vercel-CDN-Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('Gagal memuat artikel:', error instanceof Error ? error.message : '');
    return Response.json({ code: 'ARTICLE_API_UNAVAILABLE' }, { status: 502 });
  }
}
