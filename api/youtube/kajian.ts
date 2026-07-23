import { getYoutubeCacheExpiry, loadYoutubeVideos } from '../../src/youtube';

export async function GET(): Promise<Response> {
  try {
    const videos = await loadYoutubeVideos();
    return Response.json(
      { data: videos, cachedUntil: getYoutubeCacheExpiry() },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'YOUTUBE_API_KEY_MISSING') {
      return Response.json(
        {
          code: 'YOUTUBE_API_KEY_MISSING',
          message: 'YouTube API belum dikonfigurasi di server.',
        },
        { status: 503 },
      );
    }

    console.error('Gagal memuat video YouTube:', message);
    return Response.json({ message: 'Video YouTube belum dapat dimuat.' }, { status: 502 });
  }
}
