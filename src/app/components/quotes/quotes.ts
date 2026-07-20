import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timeout } from 'rxjs';

interface Rendition {
  text: string;
  provenance?: string;
}

interface QuoteAuthor {
  slug: string;
  name: Record<string, string>;
  honorific?: Record<string, string>;
  kind?: string;
  url: string;
}

interface IslamicQuote {
  id: number;
  url: string;
  original: { language: string; text: string };
  translations?: Record<string, Rendition>;
  author?: QuoteAuthor;
  tags?: string[];
  source?: string;
}

interface QuotesResponse {
  code: number;
  status: string;
  data: IslamicQuote[];
  meta: { total: number; page: number; limit: number; pages: number };
}

interface RandomQuoteResponse {
  code: number;
  status: string;
  data: IslamicQuote;
}

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './quotes.html',
  styleUrls: ['./quotes.css'],
})
export class Quotes implements OnInit, OnDestroy {
  private readonly apiUrl = 'https://quotes.api.islamic.network/v1';
  private readonly subscriptions = new Subscription();
  private listRequestId = 0;

  quotes: IslamicQuote[] = [];
  featuredQuote: IslamicQuote | null = null;
  currentPage = 1;
  totalPages = 1;
  totalQuotes = 0;
  loading = false;
  loadingRandom = false;
  error = '';
  copiedQuoteId: number | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRandomQuote();
    this.loadQuotes();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadQuotes(page = 1): void {
    const requestId = ++this.listRequestId;
    this.loading = true;
    this.error = '';

    const request = this.http
      .get<QuotesResponse>(`${this.apiUrl}/quotes?lang=id&page=${page}&limit=12`)
      .pipe(timeout(12000))
      .subscribe({
        next: (response) => {
          if (requestId !== this.listRequestId) return;
          this.quotes = Array.isArray(response.data) ? response.data : [];
          this.currentPage = response.meta?.page || page;
          this.totalPages = response.meta?.pages || 1;
          this.totalQuotes = response.meta?.total || this.quotes.length;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse | any) => {
          if (requestId !== this.listRequestId) return;
          this.loading = false;
          this.error = this.errorMessage(error);
          this.cdr.markForCheck();
        },
      });
    this.subscriptions.add(request);
  }

  loadRandomQuote(): void {
    this.loadingRandom = true;
    const request = this.http
      .get<RandomQuoteResponse>(`${this.apiUrl}/quotes/random?lang=id`)
      .pipe(timeout(12000))
      .subscribe({
        next: (response) => {
          this.featuredQuote = response.data || null;
          this.loadingRandom = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loadingRandom = false;
          this.cdr.markForCheck();
        },
      });
    this.subscriptions.add(request);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.loadQuotes(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  }

  quoteText(quote: IslamicQuote): string {
    return quote.translations?.['id']?.text || quote.original.text;
  }

  authorName(quote: IslamicQuote): string {
    return quote.author?.name?.['en'] || quote.source || 'Anonim';
  }

  showOriginal(quote: IslamicQuote): boolean {
    return (
      !!quote.translations?.['id']?.text && quote.original.text !== quote.translations['id'].text
    );
  }

  async copyQuote(quote: IslamicQuote): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(`“${this.quoteText(quote)}” — ${this.authorName(quote)}`);
    this.copiedQuoteId = quote.id;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.copiedQuoteId = null;
      this.cdr.markForCheck();
    }, 1800);
  }

  trackQuote(index: number, quote: IslamicQuote): number {
    return quote.id;
  }

  private errorMessage(error: HttpErrorResponse | any): string {
    if (error.name === 'TimeoutError') return 'Koneksi ke server quotes terlalu lama.';
    if (error.status === 0) return 'Tidak dapat terhubung ke Islamic Network.';
    return 'Quotes belum bisa dimuat. Silakan coba lagi.';
  }
}
