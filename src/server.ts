import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { getHaditsCacheExpiry, loadDailyHadits, searchHadits } from './hadits';
import { getYoutubeCacheExpiry, loadYoutubeVideos } from './youtube';
import { askZaputlah, normalizeAiContext, normalizeAiQuestion, validateAiQuestion } from './ai';

try {
  loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '16kb' }));

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
    res.json({ data: videos, cachedUntil: getYoutubeCacheExpiry() });
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

app.get('/api/hadits/daily', async (_req, res) => {
  try {
    const items = await loadDailyHadits();
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({ data: items, cachedUntil: getHaditsCacheExpiry() });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'HADITS_API_KEY_MISSING') {
      res.status(503).json({
        code: 'HADITS_API_KEY_MISSING',
        message: 'Hadits API belum dikonfigurasi di server.',
      });
      return;
    }

    console.error('Gagal memuat hadis:', message);
    res.status(message === 'HADITS_API_429' ? 429 : 502).json({
      code: message.startsWith('HADITS_API_') ? message : 'HADITS_API_ERROR',
    });
  }
});

app.get('/api/hadits/search', async (req, res) => {
  const query = String(req.query['q'] || '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('id-ID')
    .replace(/\s+/g, ' ');
  if (query.length < 3 || query.length > 60) {
    res.status(400).json({
      code: 'INVALID_QUERY',
      message: 'Kata kunci harus terdiri dari 3–60 karakter.',
    });
    return;
  }

  try {
    const items = await searchHadits(query);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.json({ data: items, query });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    console.error('Gagal mencari hadis:', message);
    res.status(message === 'HADITS_API_429' ? 429 : 502).json({
      code: message === 'HADITS_API_KEY_MISSING' ? message : 'HADITS_SEARCH_ERROR',
      message: 'Pencarian hadis belum dapat digunakan.',
    });
  }
});

app.post('/api/ai/ask', async (req, res) => {
  const question = normalizeAiQuestion((req.body as Record<string, unknown> | undefined)?.['question']);
  const validationError = validateAiQuestion(question);
  if (validationError) {
    res.status(400).json({ code: 'INVALID_QUESTION', message: validationError });
    return;
  }

  try {
    const result = await askZaputlah(
      question,
      normalizeAiContext((req.body as Record<string, unknown> | undefined)?.['context']),
    );
    res.setHeader('Cache-Control', 'private, no-store');
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    console.error('Tanya Zaputlah gagal:', message.split(':', 1)[0]);
    if (message === 'GEMINI_API_KEY_MISSING') {
      res.status(503).json({
        code: message,
        message: 'Gemini API belum dikonfigurasi di server.',
      });
      return;
    }
    res.status(502).json({
      code: 'AI_SERVICE_ERROR',
      message: 'Tanya Zaputlah belum dapat menjawab. Silakan coba lagi beberapa saat.',
    });
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
