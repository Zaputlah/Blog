import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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
}

interface ApiData {
  nomor: number;
  nama: string;
  namaLatin: string;
  arti: string;
  jumlahAyat: number;
  tempatTurun: string;
  deskripsi: string;
  audioFull: string;
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

  currentView: 'list' | 'read' = 'list';

  private apiSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {}

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
  bacaSurah(id: number) {
    this.selectedSurah = this.surahList.find((s) => s.nomor === id) || null;

    if (!this.selectedSurah) {
      this.error = 'Surah tidak ditemukan.';
      return;
    }

    this.loadingDetail = true;
    this.surahDetail = null;
    this.error = '';
    this.currentView = 'read';

    // Cancel previous API call if any
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }

    // Hit API endpoint untuk mendapatkan detail surah
    this.apiSubscription = this.http
      .get<ApiResponse>(`https://equran.id/api/v2/surat/${id}`)
      .subscribe({
        next: (res) => {
          this.loadingDetail = false;

          if (res.code === 200 && res.data) {
            this.surahDetail = res.data;
          } else {
            this.handleError({ message: 'Data surah tidak valid' });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loadingDetail = false;
          this.handleError(err);
        },
      });
  }

  // ============================================
  // NAVIGATION SURAH
  // ============================================
  nextSurah() {
    if (this.selectedSurah && this.selectedSurah.nomor < this.surahList.length) {
      this.bacaSurah(this.selectedSurah.nomor + 1);
      this.scrollToTop();
    }
  }

  previousSurah() {
    if (this.selectedSurah && this.selectedSurah.nomor > 1) {
      this.bacaSurah(this.selectedSurah.nomor - 1);
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  kembaliKeDaftar() {
    this.currentView = 'list';
    this.surahDetail = null;
    this.selectedSurah = null;
    this.currentPage = 1;
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
  private handleError(error: HttpErrorResponse | any) {
    console.error('Error:', error);

    if (error.status === 0) {
      this.error = 'Tidak dapat terhubung ke internet. Periksa koneksi Anda.';
    } else if (error.status === 404) {
      this.error = 'Data surah tidak ditemukan.';
    } else if (error.status >= 500) {
      this.error = 'Server sedang mengalami gangguan. Silakan coba lagi nanti.';
    } else if (error.message) {
      this.error = error.message;
    } else {
      this.error = 'Terjadi kesalahan yang tidak diketahui.';
    }
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
    return active
      ? 'px-3 py-1 rounded bg-green-600 text-white text-sm transition duration-200'
      : 'px-3 py-1 rounded bg-gray-100 hover:bg-green-200 text-sm transition duration-200';
  }

  getPaginationButtonClass(active: boolean) {
    return active
      ? 'px-3 py-1 rounded bg-green-600 text-white text-sm'
      : 'px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm';
  }

  // Helper untuk menampilkan tempat turun dalam bahasa Indonesia
  getTempatTurunDisplay(tempat: string): string {
    return tempat === 'Mekah' ? 'Makkiyah' : 'Madaniyah';
  }
}
