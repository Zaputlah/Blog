import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription, timeout } from 'rxjs';
import surah from '../json/surah.json';

interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
}

interface ApiAyat {
  nomorAyat: number;
  teksArab: string;
  teksIndonesia: string;
  teksLatin: string;
  audio?: Record<string, string>;
}

interface ApiData {
  nomor: number;
  nama: string;
  namaLatin: string;
  arti: string;
  jumlahAyat: number;
  tempatTurun: string;
  deskripsi: string;
  audioFull: Record<string, string> | string;
  ayat: ApiAyat[];
}

interface ApiResponse {
  code: number;
  message: string;
  data: ApiData;
}

@Component({
  selector: 'app-quran',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './quran.html',
  styleUrls: ['./quran.css'],
})
export class Quran implements OnInit, OnDestroy {
  // LIST SURAH (LOCAL JSON)
  surahList: Surah[] = [];
  filteredSurahList: Surah[] = [];

  // DETAIL SURAH (API)
  selectedSurah: Surah | null = null;
  surahDetail: ApiData | null = null;

  // FILTER
  searchTerm: string = '';
  tempatTurunFilter: string = 'all';
  ayatLengthFilter: string = 'all';

  // PAGINATION
  itemsPerPage: number = 20;
  currentPage: number = 1;

  // STATUS
  loading: boolean = false;
  loadingDetail: boolean = false;
  error: string = '';
  detailError: string = '';
  loadingSurahId: number | null = null;
  lastRequestedSurahId: number | null = null;

  currentView: 'list' | 'read' = 'list';

  private apiSubscription: Subscription | null = null;
  private surahCache = new Map<number, ApiData>();
  private readonly localSurahLoaders: Record<number, () => Promise<{ default: unknown }>> = {
    1: () => import('../json/1.json'),
    2: () => import('../json/2.json'),
    3: () => import('../json/3.json'),
    4: () => import('../json/4.json'),
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadSurah();
  }

  ngOnDestroy() {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
  }

  // ============================================
  // LOAD SURAH LIST (LOCAL JSON) - FIXED
  // ============================================
  loadSurah() {
    if (this.surahList.length > 0) {
      this.applyFilters();
      return;
    }

    this.error = '';

    try {
      // Langsung load data tanpa delay karena data lokal
      this.surahList = surah.data;
      this.filteredSurahList = [...this.surahList];
    } catch (e) {
      this.error = 'Gagal memuat data lokal.';
      console.error('Error loading surah data:', e);
    }
  }

  // ============================================
  // BACA SURAH (API) - IMPLEMENTED
  // ============================================
  async bacaSurah(id: number) {
    this.selectedSurah = this.surahList.find((s) => s.nomor === id) || null;

    if (!this.selectedSurah) {
      this.error = 'Surah tidak ditemukan.';
      return;
    }

    const cachedSurah = this.surahCache.get(id);
    if (cachedSurah) {
      this.openSurah(cachedSurah);
      return;
    }

    this.loadingDetail = true;
    this.loadingSurahId = id;
    this.lastRequestedSurahId = id;
    this.detailError = '';
    this.error = '';
    this.cdr.markForCheck();

    const wasReading = this.currentView === 'read';
    if (wasReading) {
      this.surahDetail = null;
      this.cdr.markForCheck();
    }

    // Cancel previous API call if any
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }

    const localSurah = await this.loadLocalSurahDetail(id);
    if (this.loadingSurahId !== id) {
      return;
    }

    if (localSurah) {
      this.surahCache.set(id, localSurah);
      this.openSurah(localSurah);
      return;
    }

    // Hit API endpoint untuk mendapatkan detail surah
    this.apiSubscription = this.http
      .get<ApiResponse>(`https://equran.id/api/v2/surat/${id}`)
      .pipe(timeout(12000))
      .subscribe({
        next: (res) => {
          if (res.code === 200 && res.data) {
            this.surahCache.set(id, res.data);
            this.openSurah(res.data);
          } else {
            this.handleDetailError({ message: 'Data surah tidak valid' });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.handleDetailError(err);
        },
      });
  }

  private async loadLocalSurahDetail(id: number): Promise<ApiData | null> {
    const loader = this.localSurahLoaders[id];
    if (!loader) {
      return null;
    }

    try {
      const module = await loader();
      const response = module.default as ApiResponse;
      return response.code === 200 && response.data ? response.data : null;
    } catch (err) {
      console.error('Error loading local surah data:', err);
      return null;
    }
  }

  private openSurah(data: ApiData) {
    this.loadingDetail = false;
    this.loadingSurahId = null;
    this.detailError = '';
    this.surahDetail = data;
    this.currentView = 'read';
    this.scrollToTop();
    this.cdr.markForCheck();
  }

  // ============================================
  // NAVIGATION SURAH
  // ============================================
  nextSurah() {
    if (this.selectedSurah && this.selectedSurah.nomor < this.surahList.length) {
      void this.bacaSurah(this.selectedSurah.nomor + 1);
    }
  }

  previousSurah() {
    if (this.selectedSurah && this.selectedSurah.nomor > 1) {
      void this.bacaSurah(this.selectedSurah.nomor - 1);
    }
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  kembaliKeDaftar() {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }

    this.loadingDetail = false;
    this.loadingSurahId = null;
    this.detailError = '';
    this.currentView = 'list';
    this.surahDetail = null;
    this.selectedSurah = null;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  // ============================================
  // FILTER & SEARCH
  // ============================================
  onSearchChange(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.currentPage = 1;
    this.applyFilters();
  }

  onTempatTurunFilterChange(value: string) {
    this.tempatTurunFilter = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onAyatLengthFilterChange(value: string) {
    this.ayatLengthFilter = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let list = [...this.surahList];

    // Search filter
    if (this.searchTerm.trim() !== '') {
      list = list.filter(
        (s) =>
          s.namaLatin.toLowerCase().includes(this.searchTerm) ||
          s.nama.toLowerCase().includes(this.searchTerm) ||
          s.arti.toLowerCase().includes(this.searchTerm) ||
          s.nomor.toString().includes(this.searchTerm)
      );
    }

    // Tempat turun filter
    if (this.tempatTurunFilter !== 'all') {
      list = list.filter((s) => s.tempatTurun === this.tempatTurunFilter);
    }

    // Ayat length filter
    if (this.ayatLengthFilter === 'pendek') {
      list = list.filter((s) => s.jumlahAyat <= 50);
    } else if (this.ayatLengthFilter === 'sedang') {
      list = list.filter((s) => s.jumlahAyat > 50 && s.jumlahAyat <= 100);
    } else if (this.ayatLengthFilter === 'panjang') {
      list = list.filter((s) => s.jumlahAyat > 100);
    }

    this.filteredSurahList = list;
  }

  resetFilters() {
    this.searchTerm = '';
    this.tempatTurunFilter = 'all';
    this.ayatLengthFilter = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  // ============================================
  // PAGINATION
  // ============================================
  get totalPages(): number {
    return Math.ceil(this.filteredSurahList.length / this.itemsPerPage);
  }

  get paginatedSurahList(): Surah[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSurahList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.scrollToTop();
    }
  }

  // ============================================
  // ERROR HANDLING
  // ============================================
  retryLastSurah() {
    if (this.lastRequestedSurahId) {
      void this.bacaSurah(this.lastRequestedSurahId);
    }
  }

  private handleDetailError(error: HttpErrorResponse | any) {
    console.error('Error:', error);

    this.loadingDetail = false;
    this.loadingSurahId = null;
    this.detailError = this.getErrorMessage(error);
    this.cdr.markForCheck();
  }

  private getErrorMessage(error: HttpErrorResponse | any): string {
    if (error.name === 'TimeoutError') {
      return 'Koneksi ke server Al-Quran terlalu lama. Silakan coba lagi.';
    }

    if (error.status === 0) {
      return 'Tidak dapat terhubung ke internet. Periksa koneksi Anda.';
    }

    if (error.status === 404) {
      return 'Data surah tidak ditemukan.';
    }

    if (error.status >= 500) {
      return 'Server sedang mengalami gangguan. Silakan coba lagi nanti.';
    }

    return error.message || 'Terjadi kesalahan yang tidak diketahui.';
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  trackSurah(index: number, item: Surah) {
    return item.nomor;
  }

  trackAyat(index: number, item: ApiAyat) {
    return item.nomorAyat;
  }

  getFilterButtonClass(active: boolean) {
    return active ? 'filter-button-active' : 'filter-button';
  }

  getPaginationButtonClass(active: boolean) {
    return active ? 'filter-button-active' : 'filter-button';
  }

  // Helper untuk menampilkan tempat turun dalam bahasa Indonesia
  getTempatTurunDisplay(tempat: string): string {
    return tempat === 'Mekah' ? 'Makkiyah' : 'Madaniyah';
  }
}
