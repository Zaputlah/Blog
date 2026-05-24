import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface Article {
  id: string;
  title: string;
  category: string;
  hijriDate: string;
  gregorianDate: string;
  readTime: string;
  excerpt: string;
  content: string[];
  sources: ArticleSource[];
}

interface ArticleSource {
  type: string;
  reference: string;
  note: string;
  url: string;
}

@Component({
  selector: 'app-artikel',
  imports: [CommonModule],
  templateUrl: './artikel.html',
  styleUrl: './artikel.css',
})
export class Artikel implements OnInit {
  private readonly clickStorageKey = 'zaputlah.articleClicks';

  searchTerm = '';
  selectedCategory = 'Semua';
  selectedArticle: Article | null = null;
  articleClicks: Record<string, number> = {};

  articles: Article[] = [
    {
      id: 'sepuluh-hari-zulhijah',
      title: 'Sepuluh Hari Pertama Zulhijah: Musim Amal yang Sering Terlewat',
      category: 'Ibadah',
      hijriDate: '1 Zulhijah 1447 H',
      gregorianDate: '18 Mei 2026',
      readTime: '6 menit',
      excerpt:
        'Sepuluh hari pertama Zulhijah adalah kesempatan besar untuk memperbanyak amal saleh, dzikir, sedekah, puasa, dan takbir.',
      content: [
        'Sepuluh hari pertama Zulhijah adalah hari-hari istimewa untuk memperbanyak amal saleh. Di waktu ini, seorang muslim bisa memperbaiki shalat, memperbanyak dzikir, membaca Al-Quran, bersedekah, dan menjaga lisan.',
        'Bagi yang tidak berhaji, hari-hari ini menjadi ruang latihan untuk mendekat kepada Allah dari rumah masing-masing. Amal yang kecil tetapi istiqamah bisa menjadi sebab hati lebih lembut.',
        'Mulailah dengan target sederhana: menjaga shalat tepat waktu, membaca dzikir pagi petang, memperbanyak takbir, dan menyisihkan sedekah walau sedikit.',
      ],
      sources: [
        {
          type: 'Tafsir',
          reference: 'Tafsir Ibnu Katsir, QS. Al-Fajr: 2',
          note: 'Tafsir KSU menyebut pendapat Ibnu Abbas, Ibnu az-Zubair, Mujahid, dan lainnya bahwa sepuluh malam ini adalah sepuluh hari Zulhijah.',
          url: 'https://quran.ksu.edu.sa/tafseer/katheer/sura89-aya2.html',
        },
        {
          type: 'Fatwa',
          reference: 'Syaikh Abdul Aziz bin Baz',
          note: 'Penjelasan tentang keutamaan amal saleh, puasa, dan hukum terkait sepuluh hari Zulhijah serta Hari Tasyrik.',
          url: 'https://binbaz.org.sa/fatwas/17339/%D8%A8%D8%B9%D8%B6-%D8%A7%D8%AD%D9%83%D8%A7%D9%85-%D8%B9%D8%B4%D8%B1-%D8%B0%D9%8A-%D8%A7%D9%84%D8%AD%D8%AC%D8%A9-%D9%88%D8%A7%D9%8A%D8%A7%D9%85-%D8%A7%D9%84%D8%AA%D8%B4%D8%B1%D9%8A%D9%82',
        },
      ],
    },
    {
      id: 'puasa-arafah',
      title: 'Puasa Arafah: Menata Hati Sebelum Idul Adha',
      category: 'Puasa',
      hijriDate: '9 Zulhijah 1447 H',
      gregorianDate: '26 Mei 2026',
      readTime: '5 menit',
      excerpt:
        'Puasa Arafah menjadi momen untuk memperbanyak doa, muhasabah, dan harapan ampunan sebelum memasuki Hari Raya Idul Adha.',
      content: [
        'Puasa Arafah dikerjakan pada 9 Zulhijah bagi kaum muslimin yang tidak sedang berhaji. Hari ini sangat erat dengan doa, taubat, dan pengharapan kepada rahmat Allah.',
        'Selain menahan lapar dan haus, inti Puasa Arafah adalah menata hati. Kurangi hal yang sia-sia, perbanyak istighfar, dan pilih doa-doa yang paling dibutuhkan untuk dunia dan akhirat.',
        'Agar lebih ringan, siapkan niat sejak malam, makan sahur secukupnya, dan buat daftar doa sebelum waktu berbuka.',
      ],
      sources: [
        {
          type: 'Tafsir',
          reference: 'Tafsir Ibnu Katsir, QS. Al-Hajj: 28',
          note: 'Tafsir KSU memuat pembahasan hari-hari Zulhijah, dzikir, amal saleh, dan penyebutan hadits tentang puasa Arafah.',
          url: 'https://quran.ksu.edu.sa/tafseer/katheer/sura22-aya28.html',
        },
        {
          type: 'Fatwa',
          reference: 'Syaikh Abdul Aziz bin Baz',
          note: 'Syaikh Bin Baz menjelaskan keutamaan puasa Arafah berdasarkan hadits Nabi tentang penghapus dosa setahun sebelum dan sesudahnya.',
          url: 'https://binbaz.org.sa/fatwas/7561/%D9%81%D8%B6%D9%84-%D8%B5%D9%8A%D8%A7%D9%85-%D9%8A%D9%88%D9%85-%D8%B9%D8%B1%D9%81%D8%A9',
        },
      ],
    },
    {
      id: 'makna-kurban',
      title: 'Idul Adha dan Makna Kurban: Taqwa di Balik Penyembelihan',
      category: 'Kurban',
      hijriDate: '10 Zulhijah 1447 H',
      gregorianDate: '27 Mei 2026',
      readTime: '7 menit',
      excerpt:
        'Kurban bukan sekadar penyembelihan hewan, tetapi ibadah yang mengajarkan ketaatan, pengorbanan, dan kepedulian sosial.',
      content: [
        'Idul Adha mengingatkan kita pada makna ketaatan. Kurban bukan hanya tentang hewan yang disembelih, tetapi tentang hati yang tunduk kepada perintah Allah.',
        'Daging kurban mengalirkan manfaat sosial: keluarga, tetangga, dan orang yang membutuhkan ikut merasakan kebahagiaan hari raya.',
        'Karena itu, pilih hewan kurban dengan baik, tunaikan lewat panitia yang amanah, dan jaga adab saat membagikan daging agar ibadah ini tetap membawa kemuliaan.',
      ],
      sources: [
        {
          type: 'Tafsir',
          reference: 'Tafsir Ibnu Katsir, QS. Al-Hajj: 37',
          note: 'Tafsir KSU memuat ayat bahwa daging dan darah kurban tidak sampai kepada Allah, tetapi yang sampai adalah takwa.',
          url: 'https://quran.ksu.edu.sa/tafseer/katheer/sura22-aya37.html',
        },
        {
          type: 'Fatwa',
          reference: 'Syaikh Muhammad bin Shalih al-Utsaimin',
          note: 'Penjelasan hukum dan adab kurban, termasuk penekanan bahwa tujuan kurban adalah takwa, bukan manfaat materi semata.',
          url: 'https://binothaimeen.net/ar/voice_library/lessonDetails/%D8%A7%D9%84%D8%A3%D8%B6%D8%AD%D9%8A%D8%A9/%D8%A3%D8%AD%D9%83%D8%A7%D9%85%20%D8%A7%D9%84%D8%A3%D8%B6%D8%AD%D9%8A%D8%A9/d2c03429-c71e-4c8d-a373-1cafa4ddf30e/%D8%A3%D8%AD%D9%83%D8%A7%D9%85%20%D8%A7%D9%84%D8%A3%D8%B6%D8%AD%D9%8A%D8%A9?CategoryTree=true',
        },
      ],
    },
    {
      id: 'hari-tasyrik',
      title: 'Hari Tasyrik: Dzikir, Syukur, dan Adab Menikmati Nikmat Allah',
      category: 'Dzikir',
      hijriDate: '11-13 Zulhijah 1447 H',
      gregorianDate: '28-30 Mei 2026',
      readTime: '4 menit',
      excerpt:
        'Hari Tasyrik adalah hari untuk memperbanyak takbir dan syukur, serta menjaga adab dalam menikmati nikmat Allah.',
      content: [
        'Hari Tasyrik berlangsung pada 11, 12, dan 13 Zulhijah. Pada hari-hari ini kaum muslimin memperbanyak takbir, dzikir, dan syukur kepada Allah.',
        'Hari Tasyrik juga mengajarkan keseimbangan: menikmati makanan sebagai nikmat, tetapi tetap menjaga hati dari berlebihan dan lalai.',
        'Isi hari-hari ini dengan takbir setelah shalat, silaturahmi, membantu distribusi kurban, dan mendoakan saudara yang sedang berhaji.',
      ],
      sources: [
        {
          type: 'Tafsir',
          reference: 'Tafsir Ibnu Katsir, QS. Al-Baqarah: 203',
          note: 'Tafsir KSU menjelaskan hari-hari yang terbilang sebagai Hari Tasyrik dan mengaitkannya dengan dzikir serta takbir.',
          url: 'https://quran.ksu.edu.sa/tafseer/katheer/sura2-aya203.html',
        },
        {
          type: 'Fatwa',
          reference: 'Syaikh Abdul Aziz bin Baz',
          note: 'Syaikh Bin Baz menjelaskan tafsir ayat tentang dzikir pada Hari Tasyrik dan kaitannya dengan 11, 12, dan 13 Zulhijah.',
          url: 'https://binbaz.org.sa/fatwas/19754/%D8%AA%D9%81%D8%B3%D9%8A%D8%B1-%D9%82%D9%88%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89%C2%A0%D9%88%D8%A7%D8%B0%D9%83%D8%B1%D9%88%D8%A7-%D8%A7%D9%84%D9%84%D9%87-%D9%81%D9%8A-%D8%A7%D9%8A%D8%A7%D9%85-%D9%85%D8%B9%D8%AF%D9%88%D8%AF%D8%A7%D8%AA',
        },
      ],
    },
    {
      id: 'ringkasan-manasik-haji',
      title: 'Ringkasan Manasik Haji: Dari Ihram sampai Tahallul',
      category: 'Haji',
      hijriDate: '8-13 Zulhijah 1447 H',
      gregorianDate: '25-30 Mei 2026',
      readTime: '8 menit',
      excerpt:
        'Urutan ringkas amalan haji agar pembaca memahami alur besar ibadah haji di hari-hari utama Zulhijah.',
      content: [
        'Ibadah haji memiliki rangkaian yang tertib: ihram, wukuf di Arafah, mabit di Muzdalifah, melempar jumrah, menyembelih hadyu bagi yang wajib, tahallul, dan thawaf ifadhah.',
        'Memahami alurnya membantu kita ikut merasakan suasana ibadah haji meski belum berangkat. Setiap rangkaian mengajarkan ketaatan, kesabaran, dan persaudaraan.',
        'Bagi calon jamaah, pelajari manasik dari pembimbing resmi. Bagi yang belum berhaji, jadikan hari-hari ini sebagai momen memperbanyak doa agar Allah memudahkan jalan ke Baitullah.',
      ],
      sources: [
        {
          type: 'Tafsir',
          reference: 'Tafsir Ibnu Katsir, QS. Ali Imran: 97',
          note: 'Tafsir KSU memuat dasar kewajiban haji bagi orang yang mampu menempuh perjalanan ke Baitullah.',
          url: 'https://quran.ksu.edu.sa/tafseer/katheer/sura3-aya97.html',
        },
        {
          type: 'Fatwa',
          reference: 'Syaikh Abdul Aziz bin Baz',
          note: 'Penjelasan ringkas tentang cara melaksanakan manasik haji dan kewajiban haji sekali seumur hidup bagi yang mampu.',
          url: 'https://binbaz.org.sa/audios/1817/%D9%83%D9%8A%D9%81-%D8%AA%D9%88%D8%AF%D9%8A-%D9%85%D9%86%D8%A7%D8%B3%D9%83-%D8%A7%D9%84%D8%AD%D8%AC',
        },
        {
          type: 'Fatwa',
          reference: 'Syaikh Abdul Aziz bin Baz',
          note: 'Uraian lebih rinci tentang sifat manasik haji, termasuk urutan amalan pada hari Nahr.',
          url: 'https://binbaz.org.sa/fatwas/16511/%25D8%25B5%25D9%2581%25D8%25A9-%25D9%2585%25D9%2586%25D8%25A7%25D8%25B3%25D9%2583-%25D8%25A7%25D9%2584%25D8%25AD%25D8%25AC-%25D8%25A7%25D9%2584%25D8%25AB%25D9%2584%25D8%25A7%25D8%25AB%25D8%25A9',
        },
      ],
    },
    {
      id: 'takbir-zulhijah',
      title: 'Takbir di Hari-Hari Zulhijah: Menghidupkan Rumah dengan Dzikir',
      category: 'Dzikir',
      hijriDate: '1-13 Zulhijah 1447 H',
      gregorianDate: '18-30 Mei 2026',
      readTime: '4 menit',
      excerpt:
        'Takbir bukan hanya suasana hari raya, tetapi dzikir yang menguatkan kesadaran bahwa Allah Maha Besar di atas segala urusan.',
      content: [
        'Takbir adalah dzikir yang menghidupkan hati. Di hari-hari Zulhijah, takbir mengingatkan bahwa semua urusan kecil di hadapan kebesaran Allah.',
        'Biasakan takbir di rumah, perjalanan, masjid, dan setelah shalat sesuai waktunya. Ajak keluarga melafalkannya dengan tenang dan penuh penghayatan.',
        'Ketika rumah terbiasa dengan dzikir, suasana ibadah akan terasa lebih dekat dan anak-anak ikut mengenal syiar Islam sejak dini.',
      ],
      sources: [
        {
          type: 'Tafsir',
          reference: 'Tafsir Ibnu Katsir, QS. Al-Hajj: 28',
          note: 'Tafsir KSU menyebut hari-hari yang diketahui sebagai hari-hari Zulhijah dan memuat pembahasan dzikir, tahlil, takbir, dan tahmid.',
          url: 'https://quran.ksu.edu.sa/tafseer/katheer/sura22-aya28.html',
        },
        {
          type: 'Fatwa',
          reference: 'Syaikh Abdul Aziz bin Baz',
          note: 'Penjelasan durasi takbir mutlak dan muqayyad pada hari-hari Zulhijah hingga akhir Hari Tasyrik.',
          url: 'https://binbaz.org.sa/fatwas/19909/%D9%85%D8%B3%D8%A7%D9%84%D8%A9-%D9%81%D9%8A-%D8%A7%D9%84%D8%AA%D9%83%D8%A8%D9%8A%D8%B1%C2%A0%D8%A7%D9%8A%D8%A7%D9%85-%D8%A7%D9%84%D8%AA%D8%B4%D8%B1%D9%8A%D9%82-%D9%88%D9%85%D8%AF%D8%AA%D9%87',
        },
        {
          type: 'Fatwa',
          reference: 'Syaikh Muhammad bin Shalih al-Utsaimin',
          note: 'Penjelasan bentuk takbir dan bahwa takbir Idul Adha dimulai sejak masuk Zulhijah sampai akhir Hari Tasyrik.',
          url: 'https://binothaimeen.net/ar/voice_library/lessonDetails/%D8%B5%D9%84%D8%A7%D8%A9%20%D8%A7%D9%84%D8%B9%D9%8A%D8%AF%D9%8A%D9%86/%D8%B5%D9%81%D8%A9%20%D8%A7%D9%84%D8%AA%D9%83%D8%A8%D9%8A%D8%B1%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%B9%D9%8A%D8%AF%D9%8A%D9%86%20%D9%88%D9%87%D9%84%20%D9%8A%D9%83%D9%88%D9%86%20%D8%AC%D9%85%D8%A7%D8%B9%D9%8A%D8%A7%D9%8B%D8%9F/f32177f6-0629-44b5-a099-4c0a24ae60e7/%D8%B5%D9%81%D8%A9%20%D8%A7%D9%84%D8%AA%D9%83%D8%A8%D9%8A%D8%B1%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%B9%D9%8A%D8%AF%D9%8A%D9%86%20%D9%88%D9%87%D9%84%20%D9%8A%D9%83%D9%88%D9%86%20%D8%AC%D9%85%D8%A7%D8%B9%D9%8A%D8%A7%D9%8B%D8%9F?CategoryTree=true',
        },
      ],
    },
  ];

  get categories(): string[] {
    return ['Semua', ...Array.from(new Set(this.articles.map((article) => article.category)))];
  }

  get featuredArticle(): Article {
    return this.articles[0];
  }

  get filteredArticles(): Article[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.articles.filter((article) => {
      const matchesCategory =
        this.selectedCategory === 'Semua' || article.category === this.selectedCategory;
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }

  ngOnInit() {
    this.loadClickCounts();
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  getCategoryButtonClass(category: string): string {
    return this.selectedCategory === category ? 'filter-button-active' : 'filter-button';
  }

  openArticle(article: Article) {
    this.articleClicks[article.id] = this.getClickCount(article.id) + 1;
    this.saveClickCounts();
    this.selectedArticle = article;

    if (this.isBrowser()) {
      setTimeout(() => {
        document.getElementById('artikel-detail')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }

  closeArticle() {
    this.selectedArticle = null;
  }

  getClickCount(articleId: string): number {
    return this.articleClicks[articleId] || 0;
  }

  private loadClickCounts() {
    if (!this.isBrowser()) {
      return;
    }

    try {
      const savedClicks = localStorage.getItem(this.clickStorageKey);
      this.articleClicks = savedClicks ? JSON.parse(savedClicks) : {};
    } catch {
      this.articleClicks = {};
    }
  }

  private saveClickCounts() {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem(this.clickStorageKey, JSON.stringify(this.articleClicks));
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
