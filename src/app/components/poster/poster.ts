import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Poster {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  format: string;
  typeLabel: string;
  series?: string;
  speaker?: string;
  sequence?: number;
  seriesTotal?: number;
  attendanceMode?: 'Offline' | 'Online';
}

@Component({
  selector: 'app-poster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poster.html',
  styleUrls: ['./poster.css'],
})
export class PosterComponent implements OnInit {
  displayedPosters: Poster[] = [];
  initialLoadCount = 12;
  pageSize = 8;
  searchTerm = '';
  allPosters: Poster[] = [];

  categories = ['Semua', 'Poster Kajian', 'Poster Dakwah', 'Konten Instagram'];
  selectedCategory = 'Semua';
  selectedKajianMode: 'Semua' | 'Offline' | 'Online' = 'Semua';
  kajianSeriesPage = 1;
  readonly kajianSeriesPageSize = 1;
  viewerPosters: Poster[] = [];
  viewerIndex = 0;

  // Tambahkan metadata poster baru di sini setelah gambarnya diunggah ke /public/posters-kajian.
  private kajianPosters = [
    {
      fileName: 'kesabaran-01-sampul-rangkuman-kajian.jpg',
      title: 'Kesabaran: Kunci Kemenangan dan Kedekatan dengan Allah',
      description: 'Sampul rangkuman kajian kesabaran bersama Ustadz Muhammad Nuzul Dzikri.',
    },
    {
      fileName: 'kesabaran-02-mengapa-sabar-sangat-penting.jpg',
      title: 'Mengapa Sabar Sangat Penting?',
      description: 'Keutamaan sabar, pahala tanpa batas, pertolongan, dan cinta Allah.',
    },
    {
      fileName: 'kesabaran-03-konsep-sabar-dalam-islam.jpg',
      title: 'Konsep Sabar dalam Islam',
      description: 'Sabar bukan tersiksa atau pasif, tetapi keteguhan dalam menjalani ketaatan.',
    },
    {
      fileName: 'kesabaran-04-contoh-penerapan-sehari-hari.jpg',
      title: 'Contoh Penerapan Sabar Sehari-hari',
      description: 'Penerapan sabar dalam rumah tangga, pekerjaan, menuntut ilmu, dan pergaulan.',
    },
    {
      fileName: 'kesabaran-05-inti-kajian.jpg',
      title: 'Inti Kajian Kesabaran',
      description: 'Kesimpulan tentang kekuatan, kemenangan, perlindungan, dan cinta Allah.',
    },
    {
      fileName: 'nabi-luth-01-sampul-kisah-kaum-sodom.jpg',
      title: 'Kisah Nabi Luth dan Kaum Sodom',
      description: 'Sampul rangkuman kajian bersama Ustadz Khalid Basalamah.',
    },
    {
      fileName: 'nabi-luth-02-pentingnya-keimanan-dan-syukur.jpg',
      title: 'Pentingnya Keimanan dan Syukur',
      description: 'Pelajaran keimanan, amal saleh, syukur, dan penjagaan diri dari kesesatan.',
    },
    {
      fileName: 'nabi-luth-03-kisah-dan-pelajaran-bagi-umat.jpg',
      title: 'Kisah Nabi Luth dan Pelajaran bagi Umat',
      description: 'Keteguhan Nabi Luth dalam berdakwah dan menghadapi penolakan kaumnya.',
    },
    {
      fileName: 'nabi-luth-04-peringatan-dari-kaum-sodom.jpg',
      title: 'Peringatan dari Kaum Sodom',
      description: 'Pelajaran dari pendustaan, kemungkaran, dan akibat mengabaikan peringatan.',
    },
    {
      fileName: 'nabi-luth-05-dakwah-dan-penutup.jpg',
      title: 'Dakwah dan Penutup',
      description: 'Kemuliaan dakwah, syarat berdakwah, pahala jariyah, dan tanggung jawab dai.',
    },
    {
      fileName: 'bab-harap-01-sampul-syahadat-tauhid-amal-saleh.png',
      title: 'Bab Harap: Syahadat, Tauhid, dan Buah Amal Saleh',
      description: 'Sampul rangkuman kajian online Riyaadhush Shaalihiin bersama Ustadz Muhammad Nuzul Dzikri.',
    },
    {
      fileName: 'bab-harap-02-inti-kajian-hadits-417.png',
      title: 'Inti Kajian Hadits ke-417',
      description: 'Keagungan syahadat, keimanan, keikhlasan hati, serta keyakinan kepada surga dan neraka.',
    },
    {
      fileName: 'bab-harap-03-tauhid-dan-amal-saleh.png',
      title: 'Tauhid dan Amal Saleh',
      description: 'Amal saleh sebagai buah dari pohon tauhid yang tertanam kokoh di dalam hati.',
    },
    {
      fileName: 'bab-harap-04-evaluasi-amal-musiman-atau-konsisten.png',
      title: 'Evaluasi Diri: Musiman atau Konsisten?',
      description: 'Evaluasi konsistensi iman dan amal saleh dalam pekerjaan, keluarga, dan keseharian.',
    },
    {
      fileName: 'bab-harap-05-penutup-iman-dan-amal.png',
      title: 'Penutup: Harap, Iman, dan Amal yang Berbuah',
      description: 'Kesimpulan tentang syahadat, tauhid, amal saleh yang konsisten, dan kepedulian kepada sesama.',
    },
    {
      fileName: 'kegagalan-01-sampul-menyikapi-rasa-kecewa.png',
      title: 'Menyikapi Kegagalan dan Rasa Kecewa kepada Allah',
      description: 'Sampul rangkuman kajian tanya jawab online bersama Ustadz Muhammad Nuzul Dzikri.',
    },
    {
      fileName: 'kegagalan-02-kecemasan-dan-tauhid.png',
      title: 'Inti Kajian: Kegagalan, Kecemasan, dan Tauhid',
      description: 'Menghadapi kecemasan dengan ikhtiar, pengobatan, tauhid, zikir, dan prasangka baik kepada Allah.',
    },
    {
      fileName: 'kegagalan-03-luruskan-niat-ibadah.png',
      title: 'Luruskan Niat Ibadah',
      description: 'Ibadah dilakukan untuk mencari rida Allah, bukan sebagai transaksi demi hasil duniawi.',
    },
    {
      fileName: 'kegagalan-04-muhasabah-dan-evaluasi-ikhtiar.png',
      title: 'Saat Mengalami Kegagalan',
      description: 'Muhasabah, evaluasi ikhtiar, dan memperbaiki diri tanpa menyalahkan takdir.',
    },
    {
      fileName: 'kegagalan-05-penutup-niat-yang-benar.png',
      title: 'Penutup: Niat yang Benar Saat Beribadah',
      description: 'Menyerahkan hasil kepada Allah dan menjaga ibadah agar tidak bergantung pada pencapaian duniawi.',
    },
  ];
  private mainPosterFiles = ['poster1.png'];
  private instagramPosterFiles = Array.from({ length: 30 }, (_, index) => `poster${index + 1}.jpg`);

  ngOnInit() {
    this.allPosters = [
      ...this.buildKajianPosters(),
      ...this.buildMainPosters(),
      ...this.buildInstagramPosters(),
    ];
    this.updateDisplayedPosters();
  }

  loadMore() {
    const filtered = this.getFilteredPosters();
    const nextLength = this.displayedPosters.length + this.pageSize;
    this.displayedPosters = filtered.slice(0, nextLength);
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.kajianSeriesPage = 1;
    this.updateDisplayedPosters();
  }

  filterKajianMode(mode: 'Semua' | 'Offline' | 'Online') {
    this.selectedKajianMode = mode;
    this.kajianSeriesPage = 1;
  }

  getCategoryButtonClass(category: string): string {
    return this.selectedCategory === category ? 'filter-button-active' : 'filter-button';
  }

  searchPoster(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.kajianSeriesPage = 1;
    this.updateDisplayedPosters();
  }

  updateDisplayedPosters() {
    this.displayedPosters = this.getFilteredPosters().slice(0, this.initialLoadCount);
  }

  get hasMorePosters(): boolean {
    return this.displayedPosters.length < this.getFilteredPosters().length;
  }

  get isKajianPosterEmpty(): boolean {
    return this.selectedCategory === 'Poster Kajian' && this.getFilteredPosters().length === 0;
  }

  get kajianPosterSeries(): {
    title: string;
    speaker: string;
    attendanceMode: 'Offline' | 'Online';
    posters: Poster[];
  }[] {
    const seriesMap = new Map<string, Poster[]>();

    this.getFilteredPosters().forEach((poster) => {
      if (!poster.series) return;
      if (
        this.selectedKajianMode !== 'Semua' &&
        poster.attendanceMode !== this.selectedKajianMode
      ) {
        return;
      }
      const posters = seriesMap.get(poster.series) || [];
      posters.push(poster);
      seriesMap.set(poster.series, posters);
    });

    return Array.from(seriesMap.entries()).map(([title, posters]) => ({
      title,
      speaker: posters[0]?.speaker || '',
      attendanceMode: posters[0]?.attendanceMode || 'Offline',
      posters: [...posters].sort((first, second) =>
        (first.sequence || 0) - (second.sequence || 0)
      ),
    }));
  }

  get paginatedKajianPosterSeries() {
    const startIndex = (this.kajianSeriesPage - 1) * this.kajianSeriesPageSize;
    return this.kajianPosterSeries.slice(startIndex, startIndex + this.kajianSeriesPageSize);
  }

  get kajianSeriesTotalPages(): number {
    return Math.ceil(this.kajianPosterSeries.length / this.kajianSeriesPageSize);
  }

  get kajianSeriesPageNumbers(): number[] {
    return Array.from({ length: this.kajianSeriesTotalPages }, (_, index) => index + 1);
  }

  goToKajianSeriesPage(page: number) {
    if (page < 1 || page > this.kajianSeriesTotalPages || page === this.kajianSeriesPage) return;
    this.kajianSeriesPage = page;
    setTimeout(() =>
      document.getElementById('poster-kajian-series')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    );
  }

  get currentViewerPoster(): Poster | null {
    return this.viewerPosters[this.viewerIndex] || null;
  }

  openPosterViewer(posters: Poster[], index: number) {
    this.viewerPosters = posters;
    this.viewerIndex = index;
    document.body.style.overflow = 'hidden';
  }

  closePosterViewer() {
    this.viewerPosters = [];
    this.viewerIndex = 0;
    document.body.style.overflow = '';
  }

  showPreviousPoster() {
    if (this.viewerIndex > 0) this.viewerIndex--;
  }

  showNextPoster() {
    if (this.viewerIndex < this.viewerPosters.length - 1) this.viewerIndex++;
  }

  getFilteredPosters(): Poster[] {
    let filtered = this.allPosters;

    if (this.selectedCategory !== 'Semua') {
      filtered = filtered.filter((poster) => poster.category === this.selectedCategory);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(
        (poster) =>
          poster.title.toLowerCase().includes(this.searchTerm) ||
          poster.description.toLowerCase().includes(this.searchTerm) ||
          poster.category.toLowerCase().includes(this.searchTerm) ||
          poster.typeLabel.toLowerCase().includes(this.searchTerm)
      );
    }

    return filtered;
  }

  downloadPoster(poster: Poster) {
    const link = document.createElement('a');
    link.href = poster.imageUrl;
    link.download = `${poster.title
      .toLowerCase()
      .replace(/[^\w\s-]/gi, '')
      .replace(/\s+/g, '-')}.${poster.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  handleImageError(event: Event, poster: Poster) {
    const image = event.target as HTMLImageElement;
    image.src =
      'https://via.placeholder.com/1080x1350/f6f7f4/123d34?text=' +
      encodeURIComponent(poster.title);
  }

  private buildKajianPosters(): Poster[] {
    return this.kajianPosters.map((poster, index) => ({
      id: index + 1,
      title: poster.title,
      category: 'Poster Kajian',
      imageUrl: `/posters-kajian/${poster.fileName}`,
      description: poster.description,
      format: this.getFormat(poster.fileName),
      typeLabel: 'Info Kajian',
      series:
        index < 5
          ? 'Bab Kesabaran'
          : index < 10
            ? 'Kisah Nabi Luth dan Kaum Sodom'
            : index < 15
              ? 'Bab Harap: Syahadat, Tauhid, dan Buah Amal Saleh'
              : 'Menyikapi Kegagalan dan Rasa Kecewa kepada Allah',
      speaker:
        index < 5 || index >= 10
          ? 'Ustadz Muhammad Nuzul Dzikri'
          : 'Ustadz Khalid Basalamah',
      sequence: (index % 5) + 1,
      seriesTotal: 5,
      attendanceMode: index < 10 ? 'Offline' : 'Online',
    }));
  }

  private buildMainPosters(): Poster[] {
    return this.mainPosterFiles.map((fileName, index) => ({
      id: this.kajianPosters.length + index + 1,
      title: this.toPosterTitle(fileName),
      category: 'Poster Dakwah',
      imageUrl: `/img/${fileName}`,
      description: 'Materi visual dakwah siap dibagikan dan dicetak.',
      format: this.getFormat(fileName),
      typeLabel: 'Materi Utama',
    }));
  }

  private buildInstagramPosters(): Poster[] {
    return this.instagramPosterFiles.map((fileName, index) => ({
      id: this.kajianPosters.length + this.mainPosterFiles.length + index + 1,
      title: `Poster Dakwah ${String(index + 1).padStart(2, '0')}`,
      category: 'Konten Instagram',
      imageUrl: `/posters-ig/${fileName}`,
      description: 'Konten dakwah ringkas untuk dibagikan di media sosial.',
      format: this.getFormat(fileName),
      typeLabel: 'Media Sosial',
    }));
  }

  private toPosterTitle(fileName: string): string {
    const numberMatch = fileName.match(/\d+/);
    const number = numberMatch ? numberMatch[0].padStart(2, '0') : '01';
    return `Poster Pilihan ${number}`;
  }

  private getFormat(fileName: string): string {
    return fileName.split('.').pop()?.toUpperCase() || 'IMG';
  }
}
