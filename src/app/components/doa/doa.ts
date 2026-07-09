import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription, timeout } from 'rxjs';

interface DoaItem {
  id: number;
  grup: string;
  nama: string;
  ar: string;
  tr: string;
  idn: string;
  tentang: string;
  tag: string[];
}

interface DoaResponse {
  status: string;
  total: number;
  data: DoaItem[];
}

@Component({
  selector: 'app-doa',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './doa.html',
  styleUrls: ['./doa.css'],
})
export class Doa implements OnInit, OnDestroy {
  private readonly apiUrl = 'https://equran.id/api/doa';
  private apiSubscription: Subscription | null = null;

  doaList: DoaItem[] = [];
  loading = false;
  error = '';

  searchTerm = '';
  selectedGroup = 'all';
  selectedTag = 'all';

  currentPage = 1;
  itemsPerPage = 12;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDoa();
  }

  ngOnDestroy(): void {
    this.apiSubscription?.unsubscribe();
  }

  loadDoa(): void {
    this.apiSubscription?.unsubscribe();
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.apiSubscription = this.http
      .get<DoaResponse>(this.apiUrl)
      .pipe(timeout(12000))
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && Array.isArray(response.data)) {
            this.doaList = response.data;
            this.currentPage = 1;
          } else {
            this.error = 'Data doa tidak valid.';
          }

          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.error = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  get groups(): string[] {
    return Array.from(new Set(this.doaList.map((doa) => doa.grup))).sort((a, b) =>
      a.localeCompare(b)
    );
  }

  get tags(): string[] {
    return Array.from(new Set(this.doaList.flatMap((doa) => doa.tag || []))).sort((a, b) =>
      a.localeCompare(b)
    );
  }

  get filteredDoaList(): DoaItem[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.doaList.filter((doa) => {
      const matchesGroup = this.selectedGroup === 'all' || doa.grup === this.selectedGroup;
      const matchesTag = this.selectedTag === 'all' || doa.tag?.includes(this.selectedTag);
      const searchableText = [
        doa.nama,
        doa.grup,
        doa.ar,
        doa.tr,
        doa.idn,
        doa.tentang,
        ...(doa.tag || []),
      ]
        .join(' ')
        .toLowerCase();

      return matchesGroup && matchesTag && (!query || searchableText.includes(query));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredDoaList.length / this.itemsPerPage));
  }

  get paginatedDoaList(): DoaItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDoaList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
  }

  selectGroup(group: string): void {
    this.selectedGroup = group;
    this.currentPage = 1;
  }

  selectTag(tag: string): void {
    this.selectedTag = tag;
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedGroup = 'all';
    this.selectedTag = 'all';
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.scrollToTop();
  }

  getFilterButtonClass(active: boolean): string {
    return active ? 'filter-button-active' : 'filter-button';
  }

  trackDoa(index: number, item: DoaItem): number {
    return item.id;
  }

  private scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private getErrorMessage(error: HttpErrorResponse | any): string {
    if (error.name === 'TimeoutError') {
      return 'Koneksi ke server doa terlalu lama. Silakan coba lagi.';
    }

    if (error.status === 0) {
      return 'Tidak dapat terhubung ke internet. Periksa koneksi Anda.';
    }

    if (error.status >= 500) {
      return 'Server doa sedang mengalami gangguan. Silakan coba lagi nanti.';
    }

    return error.message || 'Terjadi kesalahan saat memuat doa.';
  }
}
