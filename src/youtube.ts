const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_CACHE_TTL_MS = 15 * 60 * 1000;

const youtubeChannels = [
  { id: 'UCZHbLWGrq43F0-5Ef37CpWQ', speaker: 'Ustadz Muhammad Nuzul Dzikri' },
  { id: 'UCJHC3VbFsp7kJ2NxPGltwiw', speaker: 'Ustadz Khalid Basalamah' },
  { id: 'UCm44PmruoSbuNbZn7jFeXUw', speaker: 'Ustadz Firanda Andirja' },
];

export interface YouTubeVideo {
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

export function getYoutubeCacheExpiry(): number | null {
  return youtubeCache?.expiresAt || null;
}

export async function loadYoutubeVideos(): Promise<YouTubeVideo[]> {
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
