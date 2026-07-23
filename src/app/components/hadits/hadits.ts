import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, timeout } from 'rxjs';

interface HaditsItem {
  id: number;
  collection: string;
  arab: string;
  indonesia: string;
}

interface HaditsResponse {
  data: HaditsItem[];
  cachedUntil: number | null;
}

interface LocalHaditsCache {
  expiresAt: number;
  items: HaditsItem[];
}

interface SearchResponse {
  data: HaditsItem[];
  query: string;
}

interface SearchUsage {
  date: string;
  queries: string[];
}

interface LocalSearchCache {
  expiresAt: number;
  items: HaditsItem[];
}

@Component({
  selector: 'app-hadits',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './hadits.html',
  styleUrls: ['./hadits.css'],
})
export class Hadits implements OnInit, OnDestroy {
  private readonly cacheKey = 'zaputlah.dailyHadits.v1';
  private readonly searchUsageKey = 'zaputlah.haditsSearchUsage.v1';
  private readonly searchCachePrefix = 'zaputlah.haditsSearch.v1.';
  private readonly dailySearchLimit = 2;
  private readonly subscriptions = new Subscription();

  items: HaditsItem[] = [];
  selectedIndex = 0;
  loading = false;
  error = '';
  copied = false;
  searchQuery = '';
  searchResults: HaditsItem[] = [];
  selectedSearchHadits: HaditsItem | null = null;
  searching = false;
  searchError = '';
  searchMessage = '';
  toastMessage = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.restoreLocalCache()) this.loadHadits();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get selectedHadits(): HaditsItem | null {
    return this.selectedSearchHadits || this.items[this.selectedIndex] || null;
  }

  get remainingSearches(): number {
    return Math.max(0, this.dailySearchLimit - this.getSearchUsage().queries.length);
  }

  loadHadits(): void {
    this.loading = true;
    this.error = '';

    const request = this.http
      .get<HaditsResponse>('/api/hadits/daily', { transferCache: false })
      .pipe(timeout(15000))
      .subscribe({
        next: (response) => {
          this.items = Array.isArray(response.data) ? response.data : [];
          this.selectedIndex = 0;
          this.loading = false;
          if (this.items.length) this.saveLocalCache(response.cachedUntil);
          else this.error = 'Koleksi hadis hari ini belum tersedia.';
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse | any) => {
          this.loading = false;
          this.error = this.errorMessage(error);
          this.cdr.markForCheck();
        },
      });
    this.subscriptions.add(request);
  }

  selectHadits(index: number): void {
    if (index < 0 || index >= this.items.length) return;
    this.selectedIndex = index;
    this.selectedSearchHadits = null;
    this.copied = false;
    if (typeof window !== 'undefined') {
      document.getElementById('hadits-pilihan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  nextHadits(): void {
    if (!this.items.length) return;
    this.selectedSearchHadits = null;
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    this.copied = false;
  }

  async copyHadits(): Promise<void> {
    const item = this.selectedHadits;
    if (!item || typeof navigator === 'undefined' || !navigator.clipboard) return;

    await navigator.clipboard.writeText(
      `${item.indonesia}\n\n${this.collectionName(item.collection)}, hadis no. ${item.id}`,
    );
    this.copied = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.copied = false;
      this.cdr.markForCheck();
    }, 1800);
  }

  collectionName(collection: string): string {
    const names: Record<string, string> = {
      bukhari: 'Sahih Bukhari',
      muslim: 'Sahih Muslim',
      tirmidzi: 'Jami at-Tirmidzi',
      abu_daud: 'Sunan Abu Dawud',
      'abu-dawud': 'Sunan Abu Dawud',
      nasai: "Sunan an-Nasa'i",
      ibnu_majah: 'Sunan Ibnu Majah',
      'ibn-majah': 'Sunan Ibnu Majah',
    };
    return names[collection.toLowerCase()] || collection.replaceAll('-', ' ');
  }

  trackHadits(index: number, item: HaditsItem): string {
    return `${item.collection}-${item.id}`;
  }

  search(): void {
    const query = this.normalizeQuery(this.searchQuery);
    this.searchError = '';
    this.searchMessage = '';

    if (query.length < 3) {
      this.searchError = 'Masukkan minimal 3 karakter untuk mencari hadis.';
      return;
    }

    const cached = this.restoreSearchCache(query);
    if (cached) {
      this.searchResults = cached;
      this.searchMessage = `Menampilkan hasil tersimpan untuk “${query}”. Jatah pencarian tidak berkurang.`;
      return;
    }

    const usage = this.getSearchUsage();
    if (usage.queries.length >= this.dailySearchLimit) {
      this.showSearchLimit();
      return;
    }

    this.saveSearchUsage({ ...usage, queries: [...usage.queries, query] });
    this.searching = true;
    const request = this.http
      .get<SearchResponse>(`/api/hadits/search?q=${encodeURIComponent(query)}`, {
        transferCache: false,
      })
      .pipe(timeout(15000))
      .subscribe({
        next: (response) => {
          this.searching = false;
          this.searchResults = Array.isArray(response.data) ? response.data : [];
          this.saveSearchCache(query, this.searchResults);
          this.searchMessage = this.searchResults.length
            ? `${this.searchResults.length} hadis ditemukan untuk “${query}”.`
            : `Tidak ada hadis yang ditemukan untuk “${query}”.`;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse | any) => {
          this.searching = false;
          this.searchError =
            error.status === 429
              ? 'Batas 2 pencarian baru hari ini sudah tercapai.'
              : 'Pencarian hadis belum dapat digunakan. Silakan coba lagi nanti.';
          if (error.status === 429) this.showToast(this.searchError);
          this.cdr.markForCheck();
        },
      });
    this.subscriptions.add(request);
  }

  selectSearchResult(item: HaditsItem): void {
    this.selectedSearchHadits = item;
    this.copied = false;
    document.getElementById('hadits-pilihan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private restoreLocalCache(): boolean {
    try {
      const stored = localStorage.getItem(this.cacheKey);
      if (!stored) return false;
      const cache = JSON.parse(stored) as LocalHaditsCache;
      if (cache.expiresAt <= Date.now() || !Array.isArray(cache.items) || !cache.items.length) {
        localStorage.removeItem(this.cacheKey);
        return false;
      }
      this.items = cache.items;
      return true;
    } catch {
      localStorage.removeItem(this.cacheKey);
      return false;
    }
  }

  private saveLocalCache(serverExpiry: number | null): void {
    const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
    const expiresAt = serverExpiry && serverExpiry > Date.now() ? serverExpiry : oneDayFromNow;
    const cache: LocalHaditsCache = { expiresAt, items: this.items };
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }

  private normalizeQuery(value: string): string {
    return value.normalize('NFKC').trim().toLocaleLowerCase('id-ID').replace(/\s+/g, ' ');
  }

  private today(): string {
    return new Date().toLocaleDateString('en-CA');
  }

  private getSearchUsage(): SearchUsage {
    try {
      const stored = localStorage.getItem(this.searchUsageKey);
      const usage = stored ? (JSON.parse(stored) as SearchUsage) : null;
      if (!usage || usage.date !== this.today() || !Array.isArray(usage.queries)) {
        return { date: this.today(), queries: [] };
      }
      return usage;
    } catch {
      return { date: this.today(), queries: [] };
    }
  }

  private saveSearchUsage(usage: SearchUsage): void {
    localStorage.setItem(this.searchUsageKey, JSON.stringify(usage));
  }

  private restoreSearchCache(query: string): HaditsItem[] | null {
    try {
      const stored = localStorage.getItem(`${this.searchCachePrefix}${query}`);
      if (!stored) return null;
      const cache = JSON.parse(stored) as LocalSearchCache;
      if (cache.expiresAt <= Date.now() || !Array.isArray(cache.items)) {
        localStorage.removeItem(`${this.searchCachePrefix}${query}`);
        return null;
      }
      return cache.items;
    } catch {
      return null;
    }
  }

  private saveSearchCache(query: string, items: HaditsItem[]): void {
    const cache: LocalSearchCache = {
      items,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(`${this.searchCachePrefix}${query}`, JSON.stringify(cache));
  }

  private showSearchLimit(): void {
    this.searchError = 'Anda sudah menggunakan 2 pencarian baru hari ini. Silakan kembali besok.';
    this.showToast('Batas pencarian hari ini tercapai.');
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.markForCheck();
    }, 3000);
  }

  private errorMessage(error: HttpErrorResponse | any): string {
    if (error.name === 'TimeoutError') return 'Koneksi ke server hadis terlalu lama.';
    if (error.status === 429) return 'Kuota Hadits API sedang habis. Silakan coba kembali besok.';
    if (error.error?.code === 'HADITS_API_KEY_MISSING') {
      return 'Hadits API belum dikonfigurasi di server.';
    }
    return 'Hadis belum bisa dimuat. Silakan coba lagi.';
  }
}
