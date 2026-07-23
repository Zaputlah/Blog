import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_CACHE_TTL_MS = 15 * 60 * 1000;
const youtubeChannels = [
  { id: 'UCZHbLWGrq43F0-5Ef37CpWQ', speaker: 'Ustadz Muhammad Nuzul Dzikri' },
  { id: 'UCJHC3VbFsp7kJ2NxPGltwiw', speaker: 'Ustadz Khalid Basalamah' },
  { id: 'UCm44PmruoSbuNbZn7jFeXUw', speaker: 'Ustadz Firanda Andirja' },
];

interface YouTubeVideo {
  id: string;
  title: string;
  speaker: string;
  channelTitle: string;
  channelUrl: string;
  publishedAt: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  views: number;
  type: 'full' | 'short';
}

let youtubeCache: { expiresAt: number; videos: YouTubeVideo[] } | null = null;

function parseYoutubeDuration(duration = 'PT0S'): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
}

async function youtubeRequest<T>(path: string, params: Record<string, string>): Promise<T> {
  const apiKey = process.env['YOUTUBE_API_KEY'];
  if (!apiKey) throw new Error('YOUTUBE_API_KEY_MISSING');

  const url = new URL(`${YOUTUBE_API_URL}/${path}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`YOUTUBE_API_${response.status}`);
  return (await response.json()) as T;
}

async function loadYoutubeVideos(): Promise<YouTubeVideo[]> {
  if (youtubeCache && youtubeCache.expiresAt > Date.now()) return youtubeCache.videos;

  const playlistResults = await Promise.all(
    youtubeChannels.map(async (channel) => {
      const result = await youtubeRequest<{
        items?: Array<{
          snippet?: {
            title?: string;
            channelTitle?: string;
            publishedAt?: string;
            thumbnails?: Record<string, { url?: string }>;
            resourceId?: { videoId?: string };
          };
        }>;
      }>('playlistItems', {
        part: 'snippet',
        playlistId: `UU${channel.id.slice(2)}`,
        maxResults: '8',
      });
      return (result.items || []).map((item) => ({ ...item, speaker: channel.speaker }));
    }),
  );

  const playlistItems = playlistResults.flat();
  const videoIds = playlistItems
    .map((item) => item.snippet?.resourceId?.videoId)
    .filter((id): id is string => Boolean(id));
  if (!videoIds.length) return [];

  const details = await youtubeRequest<{
    items?: Array<{
      id?: string;
      contentDetails?: { duration?: string };
      statistics?: { viewCount?: string };
    }>;
  }>('videos', { part: 'contentDetails,statistics', id: videoIds.join(',') });
  const detailById = new Map((details.items || []).map((item) => [item.id, item]));

  const videos = playlistItems
    .map((item): YouTubeVideo | null => {
      const snippet = item.snippet;
      const id = snippet?.resourceId?.videoId;
      if (!id || !snippet?.title || snippet.title === 'Private video') return null;
      const detail = detailById.get(id);
      const durationSeconds = parseYoutubeDuration(detail?.contentDetails?.duration);
      return {
        id,
        title: snippet.title,
        speaker: item.speaker,
        channelTitle: snippet.channelTitle || item.speaker,
        channelUrl: `https://www.youtube.com/channel/${
          youtubeChannels.find((channel) => channel.speaker === item.speaker)?.id || ''
        }/videos`,
        publishedAt: snippet.publishedAt || '',
        thumbnail:
          snippet.thumbnails?.['maxres']?.url ||
          snippet.thumbnails?.['high']?.url ||
          snippet.thumbnails?.['medium']?.url ||
          `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        duration: formatDuration(durationSeconds),
        durationSeconds,
        views: Number(detail?.statistics?.viewCount || 0),
        type: durationSeconds > 0 && durationSeconds <= 180 ? 'short' : 'full',
      };
    })
    .filter((video): video is YouTubeVideo => Boolean(video))
    .sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));

  youtubeCache = { videos, expiresAt: Date.now() + YOUTUBE_CACHE_TTL_MS };
  return videos;
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

app.get('/api/youtube/kajian', async (_req, res) => {
  try {
    const videos = await loadYoutubeVideos();
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.json({ data: videos, cachedUntil: youtubeCache?.expiresAt || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'YOUTUBE_API_KEY_MISSING') {
      res.status(503).json({
        code: 'YOUTUBE_API_KEY_MISSING',
        message: 'YouTube API belum dikonfigurasi di server.',
      });
      return;
    }
    console.error('Gagal memuat video YouTube:', message);
    res.status(502).json({ message: 'Video YouTube belum dapat dimuat.' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
