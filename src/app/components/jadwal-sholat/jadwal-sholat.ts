import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription, timeout } from 'rxjs';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface JadwalHarian {
  tanggal: number;
  tanggal_lengkap: string;
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

interface JadwalBulanan {
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
  bulan_nama: string;
  jadwal: JadwalHarian[];
}

interface WaktuSholat {
  key: keyof Pick<JadwalHarian, 'imsak' | 'subuh' | 'terbit' | 'dhuha' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'>;
  label: string;
}

@Component({
  selector: 'app-jadwal-sholat',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './jadwal-sholat.html',
  styleUrls: ['./jadwal-sholat.css'],
})
export class JadwalSholat implements OnInit, OnDestroy {
  private readonly apiUrl = 'https://equran.id/api/v2/shalat';
  private readonly locationStorageKey = 'zaputlah.prayerLocation';
  private readonly subscriptions = new Subscription();
  private preferredCity = '';

  readonly months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  readonly prayerTimes: WaktuSholat[] = [
    { key: 'imsak', label: 'Imsak' },
    { key: 'subuh', label: 'Subuh' },
    { key: 'terbit', label: 'Terbit' },
    { key: 'dhuha', label: 'Dhuha' },
    { key: 'dzuhur', label: 'Dzuhur' },
    { key: 'ashar', label: 'Ashar' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isya', label: 'Isya' },
  ];

  provinces: string[] = [];
  cities: string[] = [];
  selectedProvince = 'DKI Jakarta';
  selectedCity = '';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  schedule: JadwalBulanan | null = null;

  loadingProvinces = false;
  loadingCities = false;
  loadingSchedule = false;
  error = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.restoreLocation();
    this.loadProvinces();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProvinces(): void {
    this.loadingProvinces = true;
    this.error = '';

    const request = this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/provinsi`)
      .pipe(timeout(12000))
      .subscribe({
        next: (response) => {
          this.loadingProvinces = false;
          if (response.code !== 200 || !Array.isArray(response.data)) {
            this.error = 'Daftar provinsi tidak valid.';
            this.cdr.markForCheck();
            return;
          }

          this.provinces = response.data;
          if (!this.provinces.includes(this.selectedProvince)) {
            this.selectedProvince = this.provinces[0] || '';
          }
          this.loadCities(true);
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => this.handleError(error, 'provinsi'),
      });

    this.subscriptions.add(request);
  }

  onProvinceChange(): void {
    this.selectedCity = '';
    this.preferredCity = '';
    this.schedule = null;
    this.loadCities(false);
  }

  loadCities(selectDefault: boolean): void {
    if (!this.selectedProvince) return;

    this.loadingCities = true;
    this.error = '';
    const request = this.http
      .post<ApiResponse<string[]>>(`${this.apiUrl}/kabkota`, { provinsi: this.selectedProvince })
      .pipe(timeout(12000))
      .subscribe({
        next: (response) => {
          this.loadingCities = false;
          if (response.code !== 200 || !Array.isArray(response.data)) {
            this.error = 'Daftar kabupaten/kota tidak valid.';
            this.cdr.markForCheck();
            return;
          }

          this.cities = response.data;
          if (selectDefault) {
            this.selectedCity =
              (this.preferredCity && this.cities.includes(this.preferredCity)
                ? this.preferredCity
                : '') ||
              (this.cities.includes('Kota Jakarta') ? 'Kota Jakarta' : this.cities[0] || '');
            if (this.selectedCity) this.loadSchedule();
          }
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => this.handleError(error, 'kota'),
      });

    this.subscriptions.add(request);
  }

  loadSchedule(): void {
    if (!this.selectedProvince || !this.selectedCity) {
      this.error = 'Pilih provinsi dan kabupaten/kota terlebih dahulu.';
      return;
    }

    this.loadingSchedule = true;
    this.error = '';
    const request = this.http
      .post<ApiResponse<JadwalBulanan>>(this.apiUrl, {
        provinsi: this.selectedProvince,
        kabkota: this.selectedCity,
        bulan: Number(this.selectedMonth),
        tahun: Number(this.selectedYear),
      })
      .pipe(timeout(12000))
      .subscribe({
        next: (response) => {
          this.loadingSchedule = false;
          if (response.code === 200 && response.data?.jadwal) {
            this.schedule = response.data;
            this.saveLocation();
          } else {
            this.error = response.message || 'Jadwal sholat tidak tersedia.';
          }
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => this.handleError(error, 'jadwal'),
      });

    this.subscriptions.add(request);
  }

  get highlightedSchedule(): JadwalHarian | null {
    if (!this.schedule?.jadwal.length) return null;

    const today = new Date();
    const isCurrentMonth =
      this.schedule.bulan === today.getMonth() + 1 && this.schedule.tahun === today.getFullYear();

    return isCurrentMonth
      ? this.schedule.jadwal.find((item) => item.tanggal === today.getDate()) || this.schedule.jadwal[0]
      : this.schedule.jadwal[0];
  }

  get highlightLabel(): string {
    if (!this.highlightedSchedule || !this.schedule) return '';
    const today = new Date();
    const isToday =
      this.schedule.bulan === today.getMonth() + 1 &&
      this.schedule.tahun === today.getFullYear() &&
      this.highlightedSchedule.tanggal === today.getDate();
    return isToday ? 'Jadwal hari ini' : `Jadwal ${this.highlightedSchedule.tanggal} ${this.schedule.bulan_nama}`;
  }

  isToday(item: JadwalHarian): boolean {
    const today = new Date();
    return item.tanggal_lengkap === this.toLocalDateKey(today);
  }

  trackSchedule(index: number, item: JadwalHarian): string {
    return item.tanggal_lengkap;
  }

  private toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private restoreLocation(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.locationStorageKey);
      if (!stored) return;
      const location = JSON.parse(stored) as { province?: unknown; city?: unknown };
      if (typeof location.province === 'string' && typeof location.city === 'string') {
        this.selectedProvince = location.province;
        this.preferredCity = location.city;
      }
    } catch {
      localStorage.removeItem(this.locationStorageKey);
    }
  }

  private saveLocation(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      this.locationStorageKey,
      JSON.stringify({ province: this.selectedProvince, city: this.selectedCity }),
    );
  }

  private handleError(error: HttpErrorResponse | any, target: 'provinsi' | 'kota' | 'jadwal'): void {
    this.loadingProvinces = false;
    this.loadingCities = false;
    this.loadingSchedule = false;

    if (error.name === 'TimeoutError') {
      this.error = 'Koneksi ke server jadwal sholat terlalu lama. Silakan coba lagi.';
    } else if (error.status === 0) {
      this.error = 'Tidak dapat terhubung ke EQuran.id. Periksa koneksi internet Anda.';
    } else if (error.status >= 500) {
      this.error = 'Server jadwal sholat sedang mengalami gangguan. Silakan coba lagi nanti.';
    } else {
      this.error = error.error?.message || `Gagal memuat data ${target}.`;
    }
    this.cdr.markForCheck();
  }
}
