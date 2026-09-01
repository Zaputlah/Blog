import {
  normalizeTranslationRequest,
  translateWebsiteTexts,
} from '../src/ai.js';

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ code: 'INVALID_JSON' }, { status: 400 });
  }
  const normalized = normalizeTranslationRequest(body['texts'], body['language']);
  if (!normalized) {
    return Response.json({ code: 'INVALID_TRANSLATION_REQUEST' }, { status: 400 });
  }
  try {
    const translations = await translateWebsiteTexts(normalized.texts, normalized.language);
    return Response.json(
      { translations },
      { headers: { 'Cache-Control': 'private, max-age=86400' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    console.error('Terjemahan website gagal:', message.split(':', 1)[0]);
    return Response.json(
      { code: message === 'GEMINI_API_KEY_MISSING' ? message : 'TRANSLATION_SERVICE_ERROR' },
      { status: message === 'GEMINI_API_KEY_MISSING' ? 503 : 502 },
    );
  }
}
