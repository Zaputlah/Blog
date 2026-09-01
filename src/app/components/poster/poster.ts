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
  selectedKajianSeries = 'Semua Judul';
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
    {
      fileName: 'sabar-pare-01-belajar-arti-sabar-dari-seporsi-pare.jpg',
      title: 'Belajar Arti Sabar dari Seporsi Pare',
      description: 'Belajar menerima pahitnya ujian dengan sabar dan keyakinan akan kebersamaan Allah.',
    },
    {
      fileName: 'sabar-pare-02-analogi-pare-pahit-namun-dinikmati.jpg',
      title: 'Analogi Pare: Pahit Namun Tetap Dinikmati',
      description: 'Seperti pare, sabar memang pahit dan berat tetapi dapat dijalani dengan benar.',
    },
    {
      fileName: 'sabar-pare-03-inti-pesan-sabar-itu-berat.jpg',
      title: 'Inti Pesan: Sabar Itu Memang Berat',
      description: 'Mengakui beratnya sabar sebagai langkah awal untuk menjalaninya dengan jujur.',
    },
    {
      fileName: 'sabar-pare-04-kekuatan-kesabaran-bersama-allah.jpg',
      title: 'Kekuatan di Balik Kesabaran: Bersama Allah',
      description: 'Kebersamaan Allah menghadirkan penjagaan, perlindungan, dan ketenangan.',
    },
    {
      fileName: 'sabar-pare-05-kesimpulan.jpg',
      title: 'Kesimpulan: Menikmati Proses Kesabaran',
      description: 'Menerima pahitnya ujian dengan iman membawa ketenangan hati.',
    },
    {
      fileName: 'jalan-keluar-01-memahami-jalan-keluar-dan-rezeki.jpg',
      title: 'Memahami Jalan Keluar dan Rezeki',
      description: 'Ketenangan hadir ketika hati ridha kepada ketetapan Allah.',
    },
    {
      fileName: 'jalan-keluar-02-jalan-keluar-yang-hakiki.jpg',
      title: 'Jalan Keluar yang Hakiki',
      description: 'Jalan keluar dimulai dari hati yang memahami dan meyakini ketetapan Allah.',
    },
    {
      fileName: 'jalan-keluar-03-tidak-selalu-lahir.jpg',
      title: 'Jalan Keluar Tidak Selalu Lahir',
      description: 'Allah dapat memberi jalan keluar melalui pemahaman dan ketenangan batin.',
    },
    {
      fileName: 'jalan-keluar-04-peran-ridha-dalam-penyelesaian-masalah.jpg',
      title: 'Peran Ridha dalam Penyelesaian Masalah',
      description: 'Ridha membuat hati tetap tenang meskipun masalah belum selesai secara lahir.',
    },
    {
      fileName: 'jalan-keluar-05-kesimpulan.jpg',
      title: 'Kesimpulan: Tawakal dan Ridha',
      description: 'Tawakal dan ridha menenangkan jiwa dalam menerima takdir Allah.',
    },
    {
      fileName: 'ilmu-kesabaran-01-sampul.jpg',
      title: 'Ilmu Kesabaran: Mengelola Nafsu dan Memperkuat Intelektualitas',
      description: 'Sampul rangkuman kajian tentang ilmu dan keterampilan menjalani kesabaran.',
    },
    {
      fileName: 'ilmu-kesabaran-02-urgensi-kesabaran.jpg',
      title: 'Urgensi Kesabaran',
      description: 'Kesabaran adalah kunci menikmati hidup dan menghadapi ujian dunia.',
    },
    {
      fileName: 'ilmu-kesabaran-03-dua-cara-allah-menguatkan-kesabaran.jpg',
      title: 'Dua Cara Allah Menguatkan Kesabaran',
      description: 'Memperkuat sisi intelektual dan kemauan untuk menahan hawa nafsu.',
    },
    {
      fileName: 'ilmu-kesabaran-04-contoh-penerapan-kesabaran.jpg',
      title: 'Contoh Penerapan Kesabaran',
      description: 'Penerapan sabar ketika diuji, kehilangan harta, dan mendidik anak.',
    },
    {
      fileName: 'ilmu-kesabaran-05-takdir-syukur-dan-penutup.jpg',
      title: 'Takdir, Syukur, dan Penutup',
      description: 'Menerima takdir, mensyukuri nikmat, dan menerapkan sabar dalam kehidupan.',
    },
    {
      fileName: 'hawa-nafsu-01-strategi-bijak-menaklukkan-hawa-nafsu.jpg',
      title: 'Strategi Bijak Menaklukkan Hawa Nafsu',
      description: 'Ketenangan diraih dengan menutup pintu yang menguatkan hawa nafsu.',
    },
    {
      fileName: 'hawa-nafsu-02-melemahkan-bukan-melawan.jpg',
      title: 'Melemahkan, Bukan Melawan',
      description: 'Melemahkan hawa nafsu sejak dini sebelum tumbuh semakin kuat.',
    },
    {
      fileName: 'hawa-nafsu-03-cara-praktis-menutup-akses.jpg',
      title: 'Cara Praktis Menutup Akses',
      description: 'Puasa dan menjaga pandangan menjadi benteng awal dari hawa nafsu.',
    },
    {
      fileName: 'hawa-nafsu-04-jaga-telinga-hindari-fomo.jpg',
      title: 'Jaga Telinga, Hindari FOMO',
      description: 'Menjaga pendengaran dan menyaring paparan yang masuk ke dalam hati.',
    },
    {
      fileName: 'hawa-nafsu-05-kesimpulan.jpg',
      title: 'Kesimpulan: Menutup Akses Hawa Nafsu',
      description: 'Ketegasan menutup akses adalah langkah bijak menaklukkan hawa nafsu.',
    },
    {
      fileName: 'perusak-kesabaran-01-sampul.jpg',
      title: 'Hal-Hal yang Merusak Kesabaran',
      description: 'Sampul rangkuman kajian mengenai sikap yang dapat merusak kesabaran.',
    },
    {
      fileName: 'perusak-kesabaran-02-mengeluh-kepada-makhluk.jpg',
      title: 'Mengeluh kepada Makhluk',
      description: 'Berkeluh kesah tentang takdir dapat merusak kesabaran jika tidak pada tempatnya.',
    },
    {
      fileName: 'perusak-kesabaran-03-ekspresi-kesedihan-tidak-terkontrol.jpg',
      title: 'Ekspresi Kesedihan yang Tidak Terkontrol',
      description: 'Membedakan kesedihan yang manusiawi dari ekspresi yang merusak kesabaran.',
    },
    {
      fileName: 'perusak-kesabaran-04-terlalu-sering-menceritakan-musibah.jpg',
      title: 'Terlalu Sering Menceritakan Musibah',
      description: 'Menjaga kehormatan diri dengan tidak mengumbar musibah untuk mencari simpati.',
    },
    {
      fileName: 'perusak-kesabaran-05-sifat-halu-tidak-sabar-dan-pelit.jpg',
      title: "Sifat Halu': Tidak Sabar dan Pelit",
      description: 'Sifat berkeluh kesah dan pelit menjadi indikator kurangnya latihan kesabaran.',
    },
  ];
  private kajianSeriesMetadata: {
    title: string;
    speaker: string;
    attendanceMode: 'Offline' | 'Online';
  }[] = [
    {
      title: 'Bab Kesabaran',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      attendanceMode: 'Offline',
    },
    {
      title: 'Kisah Nabi Luth dan Kaum Sodom',
      speaker: 'Ustadz Khalid Basalamah',
      attendanceMode: 'Offline',
    },
    {
      title: 'Bab Harap: Syahadat, Tauhid, dan Buah Amal Saleh',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      attendanceMode: 'Online',
    },
    {
      title: 'Menyikapi Kegagalan dan Rasa Kecewa kepada Allah',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      attendanceMode: 'Online',
    },
    {
      title: 'Belajar Arti Sabar dari Seporsi Pare',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      attendanceMode: 'Online',
    },
    {
      title: 'Memahami Jalan Keluar dan Rezeki',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      attendanceMode: 'Online',
    },
    {
      title: 'Ilmu Kesabaran: Mengelola Nafsu dan Memperkuat Intelektualitas',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      attendanceMode: 'Offline',
    },
    {
      title: 'Strategi Bijak Menaklukkan Hawa Nafsu',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      attendanceMode: 'Online',
    },
    {
      title: 'Hal-Hal yang Merusak Kesabaran',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      attendanceMode: 'Offline',
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

  filterKajianSeries(series: string) {
    this.selectedKajianSeries = series;
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
        this.selectedKajianSeries !== 'Semua Judul' &&
        poster.series !== this.selectedKajianSeries
      ) {
        return;
      }
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

  get kajianSeriesOptions(): string[] {
    const series = this.allPosters
      .filter((poster) => poster.category === 'Poster Kajian' && poster.series)
      .map((poster) => poster.series as string);

    return ['Semua Judul', ...Array.from(new Set(series))];
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
          poster.series?.toLowerCase().includes(this.searchTerm) ||
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
    return this.kajianPosters.map((poster, index) => {
      const series = this.kajianSeriesMetadata[Math.floor(index / 5)];

      return {
        id: index + 1,
        title: poster.title,
        category: 'Poster Kajian',
        imageUrl: `/posters-kajian/${poster.fileName}`,
        description: poster.description,
        format: this.getFormat(poster.fileName),
        typeLabel: 'Info Kajian',
        series: series.title,
        speaker: series.speaker,
        sequence: (index % 5) + 1,
        seriesTotal: 5,
        attendanceMode: series.attendanceMode,
      };
    });
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
