import {
  anonymousAiIdentity,
  askZaputlah,
  normalizeAiContext,
  normalizeAiQuestion,
  validateAiQuestion,
} from '../../src/ai.js';

const DAILY_LIMIT = 5;
const usage = new Map<string, number>();
let usageDate = currentDate();

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { code: 'INVALID_JSON', message: 'Format permintaan tidak valid.' },
      { status: 400 },
    );
  }
  const question = normalizeAiQuestion(readQuestion(body));
  const validationError = validateAiQuestion(question);
  if (validationError) {
    return Response.json(
      { code: 'INVALID_QUESTION', message: validationError },
      { status: 400 },
    );
  }
  if (!takeUsageSlot(anonymousAiIdentity(request))) {
    return Response.json(
      {
        code: 'DAILY_AI_LIMIT',
        message: 'Batas 5 pertanyaan hari ini sudah tercapai. Silakan kembali besok.',
      },
      { status: 429 },
    );
  }
  try {
    const result = await askZaputlah(question, normalizeAiContext(readField(body, 'context')));
    return Response.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    console.error('Tanya Zaputlah gagal:', safeErrorCode(message));
    if (message === 'GEMINI_API_KEY_MISSING') {
      return Response.json(
        { code: message, message: 'Gemini API belum dikonfigurasi di server.' },
        { status: 503 },
      );
    }
    return Response.json(
      {
        code: 'AI_SERVICE_ERROR',
        message: 'Tanya Zaputlah belum dapat menjawab. Silakan coba lagi beberapa saat.',
      },
      { status: 502 },
    );
  }
}

function readQuestion(body: unknown): unknown {
  return readField(body, 'question');
}

function readField(body: unknown, field: string): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return '';
  return (body as Record<string, unknown>)[field];
}

function takeUsageSlot(identity: string): boolean {
  const today = currentDate();
  if (usageDate !== today) {
    usageDate = today;
    usage.clear();
  }
  const used = usage.get(identity) || 0;
  if (used >= DAILY_LIMIT) return false;
  usage.set(identity, used + 1);
  return true;
}

function safeErrorCode(message: string): string {
  return message.split(':', 1)[0]?.slice(0, 80) || 'UNKNOWN_ERROR';
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}
