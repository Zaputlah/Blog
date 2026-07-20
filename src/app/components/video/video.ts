import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Subscription, timeout } from 'rxjs';

interface KajianNote {
  title: string;
  speaker: string;
  date: string;
  sortDate: string;
  location: string;
  topic: string;
  summary: string;
  points: string[];
  sourceUrl?: string;
  sourceLabel?: string;
}

interface ApiKajian {
  id: string;
  tema: string | null;
  pemateri: string | null;
  tanggal: string | null;
  eventDate: string | null;
  hari: string | null;
  waktu: string | null;
  lokasi: string | null;
  kota: string | null;
  alamat: string | null;
  penyelenggara: string | null;
  wilayah?: { kabkota: string | null; provinsi: string | null };
  image?: { url: string | null; width: number | null; height: number | null };
  sourceUrl: string | null;
}

interface ApiKajianResponse {
  data: ApiKajian[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './video.html',
  styleUrls: ['./video.css'],
})
export class Video implements OnInit, OnDestroy {
  private readonly kajianApiUrl = 'https://equran.id/api/v2/kajian';
  private readonly subscriptions = new Subscription();
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private apiRequestId = 0;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  // Video yang sedang diputar
  currentVideo: any = null;
  showVideoPlayer: boolean = false;
  activeFilter: string = 'all';
  searchQuery: string = '';
  selectedNoteMode: 'all' | 'online' | 'offline' = 'all';
  kajianNotesPage: number = 1;
  readonly kajianNotesPageSize: number = 4;
  apiKajian: ApiKajian[] = [];
  apiKajianCities: string[] = [];
  selectedApiCity = '';
  upcomingOnly = true;
  apiKajianPage = 1;
  apiKajianTotal = 0;
  apiKajianTotalPages = 1;
  loadingApiKajian = false;
  loadingMoreApiKajian = false;
  apiKajianError = '';

  ngOnInit(): void {
    this.loadApiKajian();
    this.loadApiKajianCities();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.subscriptions.unsubscribe();
  }

  loadApiKajian(reset = true): void {
    const requestId = ++this.apiRequestId;
    if (reset) {
      this.apiKajianPage = 1;
      this.loadingApiKajian = true;
    } else {
      this.loadingMoreApiKajian = true;
    }
    this.apiKajianError = '';

    const params = new URLSearchParams({
      page: String(this.apiKajianPage),
      limit: '12',
    });
    if (this.searchQuery.trim()) params.set('q', this.searchQuery.trim());
    if (this.selectedApiCity) params.set('kota', this.selectedApiCity);
    if (this.upcomingOnly) params.set('upcoming', '1');

    const request = this.http
      .get<ApiKajianResponse>(`${this.kajianApiUrl}?${params.toString()}`)
      .pipe(timeout(12000))
      .subscribe({
        next: (response) => {
          if (requestId !== this.apiRequestId) return;
          const items = Array.isArray(response.data) ? response.data : [];
          this.apiKajian = reset ? items : [...this.apiKajian, ...items];
          this.apiKajianTotal = response.pagination?.total || items.length;
          this.apiKajianTotalPages = response.pagination?.totalPages || 1;
          this.loadingApiKajian = false;
          this.loadingMoreApiKajian = false;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse | any) => {
          if (requestId !== this.apiRequestId) return;
          this.loadingApiKajian = false;
          this.loadingMoreApiKajian = false;
          this.apiKajianError =
            error.name === 'TimeoutError'
              ? 'Koneksi ke server kajian terlalu lama.'
              : error.status === 0
                ? 'Tidak dapat terhubung ke EQuran.id.'
                : 'Info kajian belum bisa dimuat. Silakan coba lagi.';
          this.cdr.markForCheck();
        },
      });
    this.subscriptions.add(request);
  }

  loadMoreApiKajian(): void {
    if (this.apiKajianPage >= this.apiKajianTotalPages || this.loadingMoreApiKajian) return;
    this.apiKajianPage += 1;
    this.loadApiKajian(false);
  }

  loadApiKajianCities(): void {
    const request = this.http
      .get<ApiKajianResponse>(`${this.kajianApiUrl}?limit=60`)
      .pipe(timeout(12000))
      .subscribe({
        next: (response) => {
          this.apiKajianCities = Array.from(
            new Set(
              (response.data || [])
                .map((item) => item.kota)
                .filter((city): city is string => !!city),
            ),
          ).sort((a, b) => a.localeCompare(b, 'id'));
          this.cdr.markForCheck();
        },
      });
    this.subscriptions.add(request);
  }

  onApiFilterChange(): void {
    this.loadApiKajian();
  }

  get showApiKajian(): boolean {
    return this.activeFilter === 'all' || this.activeFilter === 'api';
  }

  get canLoadMoreApiKajian(): boolean {
    return this.apiKajianPage < this.apiKajianTotalPages;
  }

  onPosterError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  kajianNotes: KajianNote[] = [
    {
      title: 'Urgensi dan Hakikat Kesabaran dalam Kehidupan Seorang Muslim',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Offline - Sabtu, 11 Juli 2026',
      sortDate: '2026-07-11',
      location: 'Masjid Nurul Iman Blok M',
      topic: 'Kesabaran',
      summary:
        'Kajian ini membahas urgensi dan hakikat kesabaran: janji keberuntungan, pahala tanpa batas, kebersamaan dan cinta Allah, serta pemahaman bahwa sabar bukan sikap pasif, melainkan kemampuan menahan diri sambil tetap berikhtiar secara maksimal.',
      points: [
        'Allah menjanjikan keberuntungan bagi orang yang bersabar dalam Surah Ali Imran ayat 200. Berbeda dengan harapan duniawi yang tidak memiliki garansi, janji Allah bagi orang yang sabar adalah sebuah kepastian.',
        'Ketika kehilangan sesuatu, kesabaran atas kehilangan tersebut lebih baik daripada nikmat yang diambil itu sendiri. Karena itu, seorang mukmin tidak hanya melihat apa yang hilang, tetapi juga karunia sabar yang Allah berikan.',
        'Kesabaran ketika tertimpa musibah atau kehilangan mendatangkan pahala tanpa batas, bighairi hisab, sebagaimana disebutkan dalam Surah Az-Zumar ayat 10.',
        'Allah membersamai orang-orang yang sabar dengan kebersamaan khusus yang menghadirkan pertolongan dan ketenangan hati atau tumakninatul qalb.',
        'Sabar bukan berarti tersiksa, diam tanpa tindakan, atau pasrah secara pasif. Sabar adalah keterampilan menahan diri dari hawa nafsu dan amarah agar tetap berada di jalan Allah.',
        'Sabar dan takwa merupakan benteng yang kokoh dari makar serta tipu daya musuh.',
        'Allah mencintai orang-orang yang sabar, wallahu yuhibbus shabirin, sebagaimana disebutkan dalam Surah Ali Imran ayat 146.',
        'Contoh dalam pekerjaan: ketika sudah melamar pekerjaan tetapi belum diterima, sabar berarti menerima bahwa Allah memiliki rencana terbaik sambil terus memperbaiki diri dan berikhtiar. Keadaan tersebut juga menjadi kesempatan memperoleh pahala tanpa batas.',
        'Contoh menerima takdir: seseorang mungkin terpaksa masuk ke sekolah yang semula tidak diinginkan, tetapi kemudian justru memperoleh banyak kebaikan di sana. Kondisi yang tidak sesuai harapan belum tentu buruk bagi masa depannya.',
        'Contoh dalam rumah tangga: ketika pasangan tidak sengaja menumpahkan gula, sabar dipraktikkan dengan menahan tatapan tidak suka, ucapan kasar, bahkan ekspresi kecil seperti kata “uf”.',
        'Saat menghadapi PHK atau kehilangan, sabar bukan alasan untuk menyerah. Seorang mukmin harus tetap kuat, menjaga kualitas diri, dan berikhtiar dengan totalitas. Kesabaran menjadi bahan bakar untuk terus berjuang.',
        'Mukmin yang sabar tetap menjadi al-mukminul qawi: kuat, bersungguh-sungguh dalam bekerja, dan tidak menyerah kepada keadaan. Sabar berjalan bersama usaha, bukan menggantikannya.',
        'Kesabaran dan keyakinan atau yaqin adalah kunci untuk mencapai level tertinggi dalam agama maupun dunia. Orang yang sampai pada level tersebut bukan orang yang santai, tetapi orang yang terus berjuang dan istikamah.',
      ],
    },
    {
      title: 'Kisah Nabi Luth dan Peringatan bagi Umat Manusia',
      speaker: 'Ustadz Khalid Basalamah',
      date: 'Kajian Offline - Sabtu, 11 Juli 2026',
      sortDate: '2026-07-11',
      location: 'Masjid Nurul Iman Blok M',
      topic: 'Kisah Para Nabi',
      summary:
        'Kajian serial kisah para nabi ini membahas perjalanan dakwah Nabi Luth alaihissalam kepada kaum Sodom, akibat dari pendustaan dan kemungkaran mereka, serta pentingnya menjaga iman, mensyukuri nikmat Allah, dan berdakwah dengan ilmu, keikhlasan, hikmah, dan kesabaran.',
      points: [
        'Keimanan merupakan fondasi kebahagiaan dunia dan akhirat sekaligus syarat utama diterimanya amal saleh. Iman perlu dijaga dengan ketaatan karena dapat bertambah dengan amal saleh dan berkurang akibat kemaksiatan.',
        'Syukur diwujudkan dengan menyadari seluruh fasilitas kehidupan sebagai anugerah Allah, memanfaatkannya dalam perkara halal, meningkatkan ketaatan, dan berbagi kebaikan sesuai kemampuan.',
        'Mempelajari kisah para nabi, sahabat, dan ulama membantu generasi muda memiliki teladan yang benar serta melindungi mereka dari pengaruh figur dan lingkungan yang menyesatkan.',
        'Nabi Luth alaihissalam merupakan kerabat Nabi Ibrahim alaihissalam dan termasuk orang yang pertama beriman kepada beliau. Nabi Luth kemudian diutus kepada penduduk Sodom di kawasan sekitar Laut Mati.',
        'Kaum Sodom melakukan perbuatan keji dan kemungkaran secara terang-terangan, mendustakan risalah Nabi Luth, serta menantang datangnya azab Allah. Kisah ini menjadi peringatan agar manusia tidak menormalisasi kemungkaran.',
        'Ketika para malaikat datang dalam rupa pemuda sebagai tamu Nabi Luth, kaumnya berusaha mengganggu mereka. Para malaikat kemudian menjelaskan identitas dan tugas mereka serta memerintahkan Nabi Luth meninggalkan negeri itu pada akhir malam.',
        'Nabi Luth diselamatkan bersama anggota keluarganya yang beriman. Istrinya tidak ikut selamat karena mendukung kaumnya dan mengkhianati dakwah beliau.',
        'Allah membinasakan kaum Sodom setelah mereka terus mendustakan peringatan. Dalam kajian dijelaskan bahwa mereka mengalami kebutaan sebagai azab awal, kemudian negeri mereka dibalik dan dihujani batu.',
        'Bekas negeri kaum yang diazab tidak semestinya dijadikan tempat bersenang-senang. Seorang Muslim diarahkan melewatinya dengan rasa takut, mengambil pelajaran, dan mengingat akibat kedurhakaan kepada Allah.',
        'Dakwah adalah amal mulia yang dicintai Allah sebagaimana makna Surah Fussilat ayat 33. Dakwah harus dibangun di atas ilmu, keikhlasan, hikmah, dan kesabaran, bukan sekadar semangat atau perdebatan.',
        'Tugas seorang dai adalah menyampaikan kebenaran dengan cara yang baik. Hidayah merupakan hak Allah, sehingga penolakan manusia tidak boleh membuat seorang dai meninggalkan kelembutan dan kesabaran.',
        'Orang yang mengajak kepada kebaikan memperoleh pahala seperti orang yang mengikutinya tanpa mengurangi pahala mereka. Ilmu dan jejak dakwah yang bermanfaat dapat terus mengalir sebagai amal jariyah.',
        'Kisah Nabi Luth mengajarkan pentingnya amar makruf nahi mungkar, keteguhan menghadapi tekanan lingkungan, dan keyakinan bahwa perlindungan serta keselamatan sejati datang dari Allah.',
        'Langkah praktis dari kajian ini adalah memperkuat iman, menutup pintu-pintu maksiat, memilih lingkungan yang baik, mempelajari sejarah para nabi, dan menyampaikan ilmu sesuai kapasitas dengan adab yang benar.',
      ],
    },
    {
      title: 'Kesabaran Memiliki Nilai yang Lebih Tinggi daripada Nikmat yang Hilang',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Offline - Sabtu, 04 Juli 2026',
      sortDate: '2026-07-04',
      location: 'Masjid Nurul Iman Blok M',
      topic: 'Kesabaran',
      summary:
        'Kaidah Umar bin Abdul Aziz: ketika Allah mencabut sebuah nikmat lalu menggantinya dengan kesabaran, maka kesabaran itu lebih baik daripada nikmat yang telah dicabut.',
      points: [
        'Contoh pertama: nikmat pekerjaan bisa dicabut oleh Allah dalam bentuk layoff atau PHK. Allah memberi kesabaran, dan menurut Umar bin Abdul Aziz, kesabaran karena layoff lebih baik daripada masih bekerja di perusahaan tersebut.',
        'Contoh kedua: ketika seseorang pulang kerja dan sambutan di rumah tidak sesuai harapan, kesabaran menahan amarah dan emosi lebih tinggi nilainya daripada sambutan, pelukan, atau ciuman.',
        'Inti pemahaman: nilai kesabaran yang Allah tawarkan lebih tinggi daripada nikmat yang hilang.',
        'Ibn Qayyim menyebut orang yang bersabar mendapat tiga ganjaran: salawat Allah, rahmat Allah, dan hidayah Allah.',
        'Salawat Allah adalah pujian dan kemuliaan dari Allah. Seseorang yang bersabar ketika tidak mendapat pujian manusia bisa mendapat pujian dari Allah.',
        'Rahmat Allah mencakup kasih sayang, pertolongan, ketenangan hati, ampunan, serta berbagai kebaikan di dunia dan akhirat.',
        'Hidayah Allah berarti Allah membimbing orang yang sabar agar tetap berada di jalan yang benar, kuat menghadapi ujian, dan selamat.',
        'Skill menahan kesabaran, menahan emosi, dan menahan amarah adalah skill mewah yang underrated, tetapi sangat tinggi nilainya di sisi Allah.',
        'Skill ini jarang dibahas dan kurang diminati, padahal levelnya tinggi karena nilai sabar lebih baik daripada nikmat-nikmat dunia.',
      ],
    },
    {
      title: 'Ketika Hati Hambar dalam Beribadah kepada Allah',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Online - Sabtu, 04 Juli 2026',
      sortDate: '2026-07-04',
      location: 'Online',
      topic: 'Tazkiyatun Nafs',
      summary:
        'Sesi tanya jawab ini membahas kondisi hati yang tidak lagi bergetar atau terasa hambar dalam beribadah, dengan penekanan pada mujahadatun nafs, menjaga batas syariat, menerima takdir Allah, dan memperbaiki ridha kepada Allah, Islam, dan Rasulullah.',
      points: [
        'Ketika hati terlalu bergantung kepada makhluk, seorang hamba perlu melakukan mujahadatun nafs, yaitu berjihad melawan diri sendiri agar hati kembali fokus kepada Allah.',
        'Dalam masalah masa lalu, seperti terganggu karena mantan pasangan menikah kembali atau persoalan hak asuh anak, seseorang perlu bersikap bijak dan tetap menjaga batasan syariat.',
        'Batasan syariat harus dijaga agar seseorang tidak mendzalimi diri sendiri maupun orang lain. Jika sudah bukan mahram, batasan fisik dan hati tetap harus diperhatikan.',
        'Nasihat pentingnya adalah move on, fokus pada ketaatan, dan percaya bahwa ketetapan Allah, meskipun terasa pahit, adalah yang terbaik bagi hamba-Nya sebagaimana makna QS. Al-Baqarah ayat 216.',
        'Iman bisa naik dan turun. Ketika ibadah terasa hambar, jalan keluarnya adalah memperbanyak ketaatan dan segera bertaubat dari maksiat.',
        'Rasa manis iman dapat dirasakan ketika seseorang benar-benar ridha kepada Allah sebagai Rabb, Islam sebagai agama, dan Nabi Muhammad sebagai Rasul.',
        'Masalah hambarnya ibadah seringkali bukan pada ibadahnya, seperti shalat, tetapi pada hati yang belum menerima takdir Allah atau belum sepenuhnya menerima ajaran agama dengan ikhlas.',
        'Contoh praktis: ketika salat tetap dilakukan tetapi hati terasa kosong, seseorang perlu mengevaluasi penerimaan hatinya terhadap takdir Allah, bukan hanya menambah jumlah ibadah secara lahiriah.',
        'Saat menghadapi musibah atau ketetapan yang tidak sesuai keinginan, latihan terpenting adalah menerima dengan ikhlas sebagai ketetapan Allah dan tetap menjaga ketaatan.',
      ],
    },
    {
      title: 'Menyikapi Kegagalan dan Rasa Kecewa kepada Allah',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Online - Jumat, 03 Juli 2026',
      sortDate: '2026-07-03',
      location: 'Online',
      topic: 'Tazkiyatun Nafs',
      summary:
        'Sesi tanya jawab ini membahas cara menyikapi kegagalan, kecemasan, overthinking, dan rasa kecewa kepada Allah dengan meluruskan tauhid, memperbanyak zikir, memperbaiki niat ibadah, serta memahami bahwa hasil duniawi bukan ukuran kasih sayang Allah.',
      points: [
        'Dalam menghadapi kecemasan dan overthinking, ikhtiar perlu dilakukan secara paralel: menempuh pengobatan medis untuk keluhan fisik dan memperkuat tauhid serta zikir kepada Allah.',
        'Mengingat makhluk secara berlebihan bisa menjadi sumber kegelisahan, sedangkan mengingat Allah adalah obat utama bagi hati.',
        'Apa yang kita anggap sebagai kegagalan bisa jadi merupakan bentuk kasih sayang Allah, karena keinginan kita belum tentu baik untuk jangka panjang. Makna ini sejalan dengan QS. Al-Baqarah ayat 216.',
        'Ibadah seperti shalat, zikir, sedekah, dan doa dilakukan untuk mencari ridha Allah, bukan dijadikan alat transaksi untuk memaksa target duniawi tercapai.',
        'Jika seseorang kecewa dan berhenti beribadah karena doanya belum terkabul sesuai keinginannya, itu tanda orientasi ibadahnya perlu dievaluasi.',
        'Ada bahaya ketika seseorang menjadikan akhirat sebagai sarana untuk mengejar dunia. Orang yang hanya mencari dunia tidak dijamin mendapatkannya, dan niat ibadah yang keliru bisa merugikan akhiratnya.',
        'Kegagalan adalah kesempatan untuk mengevaluasi diri, memperbaiki pemahaman agama, dan meluruskan niat, bukan alasan untuk meninggalkan ibadah.',
        'Contoh niat yang keliru: seseorang shalat tahajud atau sedekah hanya agar proyeknya berhasil. Ketika proyek gagal, ia mudah kecewa dan futur.',
        'Contoh niat yang benar: seseorang shalat karena Allah memerintahkannya dan karena ia butuh mengingat Allah. Urusan hasil duniawi ia serahkan kepada Allah karena Allah lebih tahu yang terbaik.',
        'Ketika gagal, jangan langsung menuduh takdir atau merasa Allah tidak mendengar doa. Evaluasi ikhtiar, cara berusaha, kesesuaian dengan syariat, dan dalil dari amalan yang dirutinkan.',
        'Kegagalan juga bisa menyimpan nikmat lain, seperti bertambahnya skill, kedisiplinan, pola hidup yang lebih baik, dan hidayah untuk meluruskan niat.',
        'Kesimpulannya, kekecewaan sering muncul karena hati terlalu bergantung pada hasil duniawi. Shalat adalah untuk mengingat Allah, bukan sekadar transaksi untuk mendapatkan hasil yang kita inginkan.',
      ],
    },
    {
      title: 'Sebab-sebab Sombong yang Tidak Disadari',
      speaker: 'Ustadz Dr. Firanda Andirja, MA',
      date: 'Kajian Online - Sabtu, 20 Juni 2026',
      sortDate: '2026-06-20',
      location: 'Online',
      topic: 'Akhlak',
      summary:
        'Kajian ini membahas bahaya sombong sebagai dosa besar yang sangat berbahaya, definisinya menurut hadits Nabi, sebab-sebab sombong yang sering tidak disadari, serta langkah preventif agar hati tetap tawadhu.',
      points: [
        'Sombong adalah dosa besar yang sangat berbahaya. Dalam hadits disebutkan ancaman bagi orang yang memiliki kesombongan meskipun hanya seberat biji sawi.',
        'Definisi sombong menurut hadits Nabi adalah batharul haq wa ghamthun nas, yaitu menolak kebenaran dan merendahkan manusia.',
        'Kekuasaan atau jabatan bisa menjadi sebab sombong. Seseorang dapat merasa lebih tinggi karena posisi, sebagaimana pelajaran dari kisah Firaun dan Raja Namrud.',
        'Kekuatan fisik, ketampanan, kecantikan, pakaian, atribut, kendaraan, dan harta bisa membuat seseorang merasa lebih hebat lalu merendahkan orang lain.',
        'Nasab, suku, atau keturunan juga bisa menjadi pintu kesombongan ketika seseorang merasa lebih mulia hanya karena asal-usulnya.',
        'Ilmu termasuk sebab sombong yang sangat berbahaya, karena seharusnya ilmu membuat seseorang semakin tawadhu, bukan merasa paling benar dan meremehkan orang lain.',
        'Hasad dan dengki dapat menumbuhkan kesombongan karena seseorang ingin terlihat lebih hebat daripada orang yang dihasadinya.',
        'Riya juga bisa melahirkan kesombongan, misalnya takut terlihat tidak tahu, tidak mampu, atau kalah di hadapan manusia.',
        'Contoh sombong karena jabatan: seseorang yang baru mendapat posisi tinggi lalu berubah dingin dan lupa menyapa teman lamanya.',
        'Contoh sombong karena atribut: seseorang merasa lebih berharga hanya karena memakai barang branded, jam mahal, atau kendaraan mewah.',
        'Contoh sombong karena ilmu: seseorang merasa paling benar dalam berpendapat dan merendahkan orang lain karena merasa lebih banyak belajar atau lebih senior.',
        'Langkah preventif pertama adalah tawadhu lillah, yaitu meninggalkan keinginan untuk pamer dan melatih hati agar tidak mencari pengakuan manusia.',
        'Seseorang juga perlu menjaga pola hidup agar tidak terlalu terbiasa dengan kemewahan dan kenyamanan berlebih, supaya hati tidak terlena dengan dunia.',
        'Bergaul dengan berbagai lapisan masyarakat membantu seseorang tidak merasa eksklusif atau hanya nyaman bersama kalangan yang dianggap setara.',
        'Mengingat kekurangan diri adalah obat penting, karena semua kelebihan seperti kecerdasan, ketampanan, kecantikan, kekayaan, jabatan, dan ilmu adalah titipan Allah yang bisa dicabut kapan saja.',
        'Introspeksi diri perlu sering dilakukan. Jika muncul rasa arogan, merasa lebih baik, atau merendahkan orang lain, segera beristighfar dan kembali menundukkan hati.',
      ],
    },
    {
      title: 'Menjaga Harmoni antara Istri dan Ibu Mertua',
      speaker: 'Ustadz Dr. Firanda Andirja, MA',
      date: 'Kajian Online - Ahad, 28 Januari 2024',
      sortDate: '2024-01-28',
      location: 'Online',
      topic: 'Rumah Tangga',
      summary:
        'Kajian ini membahas cara membangun hubungan yang harmonis antara istri dan ibu mertua, dengan menyoroti akar konflik, batasan syariat, hak privasi rumah tangga, adab masing-masing pihak, dan peran suami sebagai penengah yang menenangkan.',
      points: [
        'Akar masalah sering muncul karena kurangnya ketakwaan dan kurangnya pemahaman terhadap batasan syariat dalam hubungan keluarga besar setelah pernikahan.',
        'Dari sisi ibu mertua, konflik bisa muncul karena rasa cemburu ketika perhatian anak berkurang setelah menikah, atau karena ekspektasi terhadap menantu tidak sesuai dengan realita.',
        'Dari sisi istri, masalah bisa muncul karena kurang adab, kurang sopan santun, terlalu banyak menuntut suami, atau kurang menghargai keluarga suami.',
        'Dari sisi suami, konflik dapat bertambah ketika ia kurang mandiri, terlalu bergantung kepada orang tua, sering menceritakan aib istri kepada orang tua, atau gagal menjadi penengah.',
        'Suami perlu memahami bahwa istri memiliki hak privasi dan tempat tinggal yang memungkinkan rumah tangga dibangun dengan mandiri, tanpa intervensi berlebihan.',
        'Jika dalam kondisi tertentu keluarga harus tinggal bersama, suami harus lebih bijak, menjaga keridaan istri, dan tetap menunaikan kewajiban nafkah dengan baik.',
        'Ibu mertua sebaiknya memperlakukan menantu seperti anak sendiri, memberi arahan dengan kasih sayang, dan menahan diri dari campur tangan berlebihan dalam urusan rumah tangga anak.',
        'Istri perlu memahami bahwa orang tua atau mertua yang sudah lanjut usia bisa lebih sensitif, sehingga perlu diberi uzur dan disikapi dengan sabar.',
        'Berbakti dan berbuat baik kepada mertua bisa diniatkan sebagai ladang pahala, meskipun secara syariat istri tidak memikul kewajiban mutlak untuk melayani keluarga suami.',
        'Suami tidak seharusnya menjadi wasit yang menghakimi salah satu pihak. Peran suami adalah menjadi peredam, peneduh, dan pemersatu antara ibu dan istri.',
        'Contoh menghadapi mertua yang sensitif: ketika ibu mertua berbicara dengan nada tinggi, menantu bisa menjawab dengan sopan dan tidak membantah di depan beliau agar suasana tidak semakin panas.',
        'Contoh peran suami sebagai peneduh: ketika terjadi perselisihan, suami menenangkan kedua pihak dengan bahasa yang lembut, bukan sibuk mencari siapa yang paling salah.',
        'Contoh bakti sebagai ladang pahala: istri dapat membantu merawat atau menyuapi ibu mertua ketika sakit dengan niat berbuat baik kepada suami dan mencari pahala dari Allah.',
        'Contoh membangun kemandirian: suami tidak menceritakan detail aib rumah tangga kepada orang tua, tetapi berusaha menyelesaikan masalah internal bersama istri terlebih dahulu.',
        'Suami yang baik adalah yang mampu mengatur waktu, perhatian, dan tanggung jawab sehingga hak istri dan hak ibu dapat tertunaikan secara adil dan bijak.',
      ],
    },
    {
      title: 'Kriteria Memilih Pasangan Hidup dalam Islam',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Online - Kamis, 28 Maret 2024',
      sortDate: '2024-03-28',
      location: 'Online',
      topic: 'Riyaadhush Shaalihiin',
      summary:
        'Kajian ini membahas hadits Abu Hurairah radhiallahu anhu dalam kitab Riyaadhush Shaalihiin tentang empat kriteria umum seseorang memilih istri: harta, nasab, kecantikan, dan agama, dengan penekanan bahwa agama harus menjadi prioritas utama.',
      points: [
        'Nabi menjelaskan bahwa secara umum wanita dinikahi karena empat perkara: hartanya, nasabnya, kecantikannya, dan agamanya.',
        'Harta sering menjadi faktor karena seseorang ingin mendapatkan manfaat finansial atau memperbaiki kondisi duniawinya melalui pernikahan.',
        'Nasab berarti keturunan atau latar belakang keluarga, sedangkan kecantikan berkaitan dengan daya tarik fisik.',
        'Kriteria agama adalah kualitas iman, ketakwaan, dan komitmen seseorang kepada Allah. Inilah yang ditekankan Rasulullah agar diprioritaskan.',
        'Rasulullah menekankan fadfar bidzatiddin, yaitu pilihlah wanita yang baik agamanya agar seseorang mendapatkan keberuntungan dan kebahagiaan sejati dalam pernikahan.',
        'Pernikahan adalah komitmen panjang, bukan hubungan sementara. Karena itu, orientasi agama menjadi fondasi agar rumah tangga tidak hanya terlihat sukses di dunia, tetapi juga diridai Allah.',
        'Realitas di masyarakat menunjukkan sebagian laki-laki hanya mengincar harta wanita. Ini menjadi peringatan bagi wanita dan wali agar berhati-hati serta selektif terhadap calon yang datang melamar.',
        'Laki-laki diingatkan agar tidak menjadikan pernikahan sebagai jalan memanfaatkan harta istri, karena orientasi seperti ini dapat merusak keharmonisan dan menghilangkan keberkahan.',
        'Contoh memilih karena harta: seorang pria melamar hanya karena wanita berasal dari keluarga kaya atau memiliki karier mapan. Ketika harta hilang atau muncul masalah keuangan, ikatan pernikahan mudah rapuh karena sejak awal tidak dibangun karena Allah.',
        'Contoh memilih karena kecantikan: seseorang hanya melihat paras wajah. Ketika ujian hidup datang, seperti penuaan atau cobaan fisik, kebahagiaan mudah luntur karena tidak ada fondasi agama dan karakter yang kuat.',
        'Contoh pilihan agama: pasangan yang taat memiliki kompas dalam rumah tangga. Ketika konflik muncul, keduanya merujuk kepada hukum Allah dan saling mengingatkan dalam kebaikan.',
        'Faktor duniawi seperti harta, rupa, dan nasab boleh dipertimbangkan, tetapi tidak boleh mengalahkan prioritas agama.',
        'Saran utama kajian ini adalah menjadikan agama sebagai fondasi pilihan pasangan agar kebahagiaan pernikahan tidak hanya bersifat sementara, tetapi membawa keberkahan dan orientasi akhirat.',
      ],
    },
    {
      title: 'Kesetiaan dan Saling Mendoakan dalam Hubungan',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Online - Senin, 15 Juli 2024',
      sortDate: '2024-07-15',
      location: 'Online',
      topic: 'Riyaadhush Shaalihiin',
      summary:
        'Kajian ini membahas penutup Bab 45 dalam kitab Riyaadhush Shaalihiin tentang pentingnya kesetiaan dan budaya saling mendoakan dalam pertemanan, persaudaraan, dan rumah tangga.',
      points: [
        'Doa adalah ciri khas orang beriman dan inti ibadah. Hubungan yang berkah, baik antara suami istri, sahabat, maupun saudara, seharusnya dibangun di atas budaya saling mendoakan.',
        'Ustadz mencontohkan kisah Uwais Al-Qarni dan kebiasaan Abu Darda yang mendoakan banyak saudaranya dalam sujud sebagai bentuk perhatian dan kesetiaan iman.',
        'Sahabat atau pasangan yang saleh adalah mereka yang tetap tulus ketika kita tidak hadir, bahkan ketika kita telah wafat.',
        'Kesetiaan yang melampaui dunia tampak ketika seseorang tetap mendoakan saudaranya di tengah malam, sementara orang lain mungkin sibuk membicarakan harta warisan atau urusan dunia.',
        'Orang yang saleh mencemaskan nasib akhirat saudaranya dan mendoakan agar amal yang dipersembahkan kepada Allah diterima.',
        'Menjaga hubungan membutuhkan effort, bukan hanya perasaan. Hal sederhana seperti mempelajari doa shalat jenazah untuk pasangan atau saudara adalah bentuk kesungguhan dalam mencintai karena Allah.',
        'Doa untuk orang yang telah wafat diibaratkan para ulama seperti hadiah bagi mereka yang masih hidup. Ini menjadi bentuk kasih sayang yang sangat berarti bagi orang yang sudah meninggal dunia.',
        'Contoh mendoakan pasangan: meluangkan waktu dalam sujud untuk mendoakan suami atau istri agar mendapat rahmat, hidayah, perlindungan, dan keberkahan dari Allah.',
        'Contoh mendoakan sahabat: membiasakan menyebut nama saudara atau teman dalam doa, sebagaimana Abu Darda yang terbiasa mendoakan banyak saudaranya.',
        'Contoh adab bertanya: sebelum bertanya kepada guru atau teman, awali dengan salam, doa, atau ucapan baik seperti Jazakumullah khairan sebagai bentuk penghargaan terhadap ilmu dan orang yang memberi ilmu.',
        'Contoh kesetiaan saat berduka: belajar doa shalat jenazah agar ketika orang yang dicintai wafat, kita dapat mendoakannya dengan benar dan tidak bersikap acuh.',
        'Kajian ini mengajak untuk memperbaiki diri, membiasakan mendoakan orang lain, dan memanfaatkan bulan-bulan mulia untuk meningkatkan amal kebaikan.',
      ],
    },
    {
      title: 'Bab Harap: Syahadat, Tauhid, dan Buah Amal Saleh',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Online - Rabu, 08 Juli 2026',
      sortDate: '2026-07-08',
      location: 'Online',
      topic: 'Riyaadhush Shaalihiin',
      summary:
        'Kajian ini membahas kitab Riyaadhush Shaalihiin pada Bab Harap, hadits ke-417 dari Ubadah bin ash-Shamit radhiallahu taala anhu, tentang agungnya syahadat, tauhid, dan buah amal saleh dalam kehidupan.',
      points: [
        'Inti hadits: hadits ini menekankan keutamaan persaksian Laa ilaha illallah dan Muhammad Rasulullah, pengakuan terhadap kedudukan Nabi Isa alaihissalam, serta keyakinan terhadap surga dan neraka. Barangsiapa bersaksi dengan ikhlas, Allah akan memasukkannya ke dalam surga.',
        'Pentingnya syahadatain: kalimat syahadat adalah pintu masuk iman dan pondasi utama dalam Islam. Persaksian ini bukan sekadar ucapan, tetapi harus dibarengi dengan keikhlasan hati.',
        'Hubungan tauhid dan amal: para ulama, seperti Ibn Qayyim, menjelaskan bahwa kalimat syahadat adalah al-kalimah thayyibah. Jika diucapkan dengan benar, ia akan melahirkan amal saleh lahir dan batin.',
        'Amal saleh adalah buah dari pohon tauhid yang tertanam di dalam hati. Karena itu, iman yang benar seharusnya tampak pada amal dan akhlak sehari-hari.',
        'Perumpamaan pohon dalam QS. Ibrahim ayat 24-25 menunjukkan iman seperti pohon yang akarnya kokoh, cabangnya menjulang ke langit, dan berbuah setiap waktu dengan izin Allah.',
        'Iman yang benar akan membuahkan amal saleh yang konsisten, bukan hanya musiman ketika Ramadan, umrah, haji, atau saat berada di lingkungan kajian.',
        'Evaluasi diri: apakah ibadah dan amal saleh kita sudah menjadi buah yang berkesinambungan dalam kehidupan sehari-hari, atau hanya muncul ketika berada di tempat dan suasana tertentu?',
        'Contoh kondisi musiman: seseorang rajin shalat atau berbuat baik hanya saat berada di kajian, bulan Ramadan, umrah, atau haji, lalu amalnya hilang atau berkurang drastis ketika kembali ke rutinitas.',
        'Contoh kondisi konsisten: di kantor tetap amanah dan jujur, di rumah tetap memuliakan istri, anak, dan orang tua, serta saat liburan tetap menjaga shalat dan batasan agama.',
        'Intinya, jika pohon iman sudah kokoh, buah berupa akhlak dan ibadah akan muncul kapan pun dan di mana pun, tanpa menunggu waktu tertentu saja.',
        'Kajian ditutup dengan ajakan untuk saling menolong saudara yang sedang diuji dengan penyakit melalui program sedekah rutin.',
      ],
    },
    {
      title: 'Problematika Rumah Tangga: Hak, Kewajiban, dan Tabayyun',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Online - Ahad, 05 Juli 2026',
      sortDate: '2026-07-05',
      location: 'Online',
      topic: 'Rumah Tangga',
      summary:
        'Sesi tanya jawab ini membahas problematika rumah tangga yang kompleks, khususnya ketika istri tidak lagi menghormati suami, dengan penekanan pada hak dan kewajiban, nafkah, adab mengambil keputusan, serta pentingnya tabayyun.',
      points: [
        'Kewajiban nafkah berkaitan dengan tamkin, yaitu akses atau pelayanan istri kepada suami. Dalam pembahasan fikih, jika istri menolak melayani suami tanpa uzur syari, maka hak nafkahnya dapat gugur.',
        'Menolak ajakan suami ke tempat tidur tanpa alasan syari yang sah termasuk dosa besar. Namun, ada uzur yang dibenarkan, seperti sakit berat, kondisi fisik yang membahayakan, sedang haid, atau permintaan yang menyimpang dari syariat.',
        'Contoh tamkin: jika seorang istri sengaja dan terus-menerus menolak hubungan suami istri tanpa uzur syari, maka dalam fikih suami tidak lagi memikul kewajiban nafkah yang sama. Hal ini bukan izin untuk berlaku semena-mena, tetapi penegasan hak dan kewajiban dalam pernikahan.',
        'Kesibukan duniawi, seperti bisnis atau jualan online, tidak otomatis menjadi uzur syari untuk mengabaikan kewajiban kepada suami jika tidak ada kondisi medis atau alasan syari yang nyata.',
        'Istri dibenarkan, bahkan wajib, menolak jika suami meminta hubungan dengan cara yang diharamkan, meminta ketika istri sedang haid, atau ketika kondisi istri sakit dan hubungan tersebut membahayakan atau menimbulkan rasa sakit yang tidak wajar.',
        'Keputusan talak tidak boleh diambil tergesa-gesa hanya dari satu sisi cerita. Masalah rumah tangga perlu didudukkan dengan objektif dan sebaiknya mendengar penjelasan dari kedua belah pihak.',
        'Tabayyun penting sebelum mengambil keputusan besar seperti perceraian. Cerita satu pihak bisa memiliki framing tertentu, sehingga pendengar atau penengah tidak seharusnya langsung menjatuhkan vonis.',
        'Seorang suami perlu mandiri dalam kebenaran. Walaupun keluarga atau lingkungan mendukung perilaku yang salah, ia tetap harus berpegang pada al-haq dan tidak larut dalam opini orang lain.',
        'Parameter nafkah mengikuti kemampuan finansial suami, bukan tuntutan atau standar gaya hidup istri. Prinsip ini merujuk pada Surah At-Talaq ayat 7.',
        'Contoh nafkah: jika penghasilan suami pas-pasan, ia tidak dibebani memenuhi tuntutan rumah mewah atau gaya hidup tinggi. Ia wajib memberi nafkah sesuai kemampuannya, sementara tuntutan yang melampaui kemampuan perlu diluruskan.',
        'Sebelum memutuskan bercerai, suami disarankan mengevaluasi diri, mencari akar masalah dengan bijak, berkomunikasi dengan kepala dingin, dan menempuh jalan perbaikan semampunya.',
      ],
    },
    {
      title: 'Bab Harap: Rahmat Allah dalam QS. Al-Araf Ayat 156',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Online - Senin, 06 Juli 2026',
      sortDate: '2026-07-06',
      location: 'Online',
      topic: 'Riyaadhush Shaalihiin',
      summary:
        'Kajian ini membahas konsep rahmat Allah berdasarkan QS. Al-Araf ayat 156 dalam Bab Raja atau Harapan dari kitab Riyaadhush Shaalihiin, terutama tentang rahmat umum, rahmat khusus, dan dorongan agar seorang hamba tidak berputus asa dari rahmat Allah.',
      points: [
        'Rahmat umum adalah kasih sayang Allah yang diberikan kepada seluruh makhluk tanpa terkecuali. Allah memberi fasilitas duniawi, rezeki, udara, sinar matahari, kesehatan, dan berbagai nikmat kepada orang beriman maupun orang kafir.',
        'Rahmat khusus adalah rahmat spesial yang menjadi kunci kebahagiaan dunia dan akhirat. Rahmat ini Allah tetapkan bagi hamba yang bertakwa, menunaikan zakat, dan beriman kepada ayat-ayat Allah.',
        'Contoh rahmat khusus adalah hidayah, taufik, dan keimanan. Seseorang yang dahulu jauh dari agama lalu tergerak belajar shalat, meninggalkan kebiasaan buruk, dan merasakan ketenangan batin sedang mendapatkan bentuk rahmat khusus dari Allah.',
        'Seorang hamba tidak boleh berputus asa dari rahmat Allah. Hidayah, kesempatan bertaubat, dan perubahan hidup menuju ketaatan adalah bukti nyata bahwa pintu rahmat Allah selalu terbuka.',
        'Walaupun seseorang merasa dosanya banyak, Allah tetap membuka pintu taubat dan memberi bimbingan kepada hamba yang ingin kembali kepada-Nya.',
        'Sikap yang benar adalah menyadari bahwa kenikmatan, kemudahan hidup, dan kesabaran orang-orang di sekitar kita merupakan bentuk kasih sayang Allah yang seharusnya membuat kita semakin dekat kepada-Nya.',
        'Contoh implementasi harapan: ketika seseorang sadar bahwa ia masih diberi rezeki padahal banyak dosa, kesadaran itu seharusnya tidak membuatnya putus asa, tetapi mendorongnya segera bertaubat.',
        'Kesabaran pasangan, orang tua, atau orang-orang dekat dalam menghadapi kekurangan kita juga merupakan rahmat Allah yang dititipkan melalui mereka agar kita tidak semakin jauh dan tersesat.',
        'Pesan penutup kajian mengingatkan tentang contoh Pak Ruslan, seorang warga terdampak banjir yang tetap berusaha mencari rezeki halal dan bersyukur atas ujian Allah sebagai bentuk keyakinan terhadap rahmat-Nya.',
      ],
    },
    {
      title: 'Bab Harap: Rahmat Umum, Rahmat Khusus, dan Pintu Tobat',
      speaker: 'Ustadz Muhammad Nuzul Dzikri',
      date: 'Kajian Online - Selasa, 07 Juli 2026',
      sortDate: '2026-07-07',
      location: 'Online',
      topic: 'Riyaadhush Shaalihiin',
      summary:
        'Kajian ini membahas konsep rahmat Allah dalam bab raja atau rasa harap berdasarkan tafsir Surah Al-Araf ayat 156, dengan penekanan pada perbedaan rahmat umum dan rahmat khusus, bahaya istidraj, serta luasnya pintu tobat.',
      points: [
        'Rahmat umum mencakup seluruh makhluk, baik yang beriman maupun kafir, yang taat maupun yang bermaksiat. Setiap makhluk merasakan kasih sayang Allah melalui napas, kesehatan, kesempatan hidup, dan nikmat duniawi lainnya.',
        'Rahmat khusus hanya Allah tetapkan bagi orang-orang yang bertakwa, menunaikan zakat, dan beriman kepada ayat-ayat Allah. Rahmat ini membawa kebahagiaan dunia dan akhirat, perlindungan khusus, serta pertolongan Allah.',
        'Iblis pernah mencoba mengklaim dirinya masuk dalam cakupan ayat bahwa rahmat Allah meliputi segala sesuatu. Namun, kelanjutan ayat membatasi rahmat khusus untuk orang-orang yang bertakwa dan beriman.',
        'Iblis tidak termasuk dalam rahmat khusus karena kesombongan, kekafiran, dan ketidaktaatannya kepada Allah.',
        'Keberhasilan duniawi, kekayaan, atau fasilitas hidup tidak boleh otomatis dianggap sebagai tanda seseorang mendapatkan rahmat khusus dari Allah.',
        'Jika pencapaian duniawi diraih melalui cara haram atau maksiat, maka itu bukan rahmat khusus, melainkan bisa menjadi istidraj, yaitu penguluran waktu yang justru menjerumuskan menuju azab.',
        'Walaupun seseorang belum mendapatkan rahmat khusus karena dosa-dosanya, ia tetap masih berada dalam rahmat umum selama Allah memberi akal, waktu, dan nyawa.',
        'Pintu tobat selalu terbuka selama seorang hamba masih hidup dan mau kembali kepada Allah. Ini adalah bukti kasih sayang Allah yang sangat besar.',
        'Rasa harap yang benar membuat seorang hamba tidak putus asa, tetapi juga tidak menjadikan rahmat Allah sebagai alasan untuk terus bermaksiat.',
      ],
    },
  ];

  get filteredKajianNotes() {
    if (
      this.activeFilter === 'api' ||
      this.activeFilter === 'full' ||
      this.activeFilter === 'short'
    ) {
      return [];
    }

    let notes = this.kajianNotes;

    if (this.selectedNoteMode !== 'all') {
      notes = notes.filter((note) => {
        const isOnline =
          note.date.toLowerCase().includes('kajian online') ||
          note.location.trim().toLowerCase() === 'online';
        return this.selectedNoteMode === 'online' ? isOnline : !isOnline;
      });
    }

    if (this.searchQuery.trim()) {
      notes = this.filterNotesBySearch(notes);
    }

    return [...notes].sort((firstNote, secondNote) =>
      secondNote.sortDate.localeCompare(firstNote.sortDate),
    );
  }

  get showKajianNotes(): boolean {
    return this.activeFilter === 'all' || this.activeFilter === 'notes';
  }

  selectNoteMode(mode: 'all' | 'online' | 'offline'): void {
    this.selectedNoteMode = mode;
    this.kajianNotesPage = 1;
  }

  get paginatedKajianNotes(): KajianNote[] {
    const startIndex = (this.kajianNotesPage - 1) * this.kajianNotesPageSize;
    return this.filteredKajianNotes.slice(startIndex, startIndex + this.kajianNotesPageSize);
  }

  get kajianNotesTotalPages(): number {
    return Math.ceil(this.filteredKajianNotes.length / this.kajianNotesPageSize);
  }

  get kajianNotesPageNumbers(): number[] {
    return Array.from({ length: this.kajianNotesTotalPages }, (_, index) => index + 1);
  }

  get kajianNotesPageStart(): number {
    return this.filteredKajianNotes.length
      ? (this.kajianNotesPage - 1) * this.kajianNotesPageSize + 1
      : 0;
  }

  get kajianNotesPageEnd(): number {
    return Math.min(
      this.kajianNotesPage * this.kajianNotesPageSize,
      this.filteredKajianNotes.length,
    );
  }

  // Data untuk featured videos
  featuredVideos = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Tafsir Surat Al-Fatihah - Ustadz Adi Hidayat',
      speaker: 'Ustadz Adi Hidayat',
      duration: '45:12',
      views: '15.2K',
      date: '3 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      type: 'full',
    },
    {
      id: 'GwTnpO74l4A',
      title: '3 Keutamaan Shalat Subuh - Ustadz Khalid Basalamah',
      speaker: 'Ustadz Khalid Basalamah',
      duration: '01:45',
      views: '8.7K',
      date: '1 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/GwTnpO74l4A/hqdefault.jpg',
      type: 'short',
    },
  ];

  // Data untuk full length videos
  fullVideos = [
    {
      id: '-GwTnpO74l4',
      title: 'Doa Ketika Bersin',
      speaker: 'Ustadz Khalid Basalamah',
      duration: '07:24',
      views: '5.8K',
      date: '7 tahun yang lalu',
      thumbnail: 'https://img.youtube.com/vi/-GwTnpO74l4/hqdefault.jpg',
      category: 'Doa',
      type: 'full',
    },
    {
      id: '3-wVZm2yZy4',
      title: 'Yang Terbaik Pilihan Allah',
      speaker: 'Ustadz Firanda Andirja',
      duration: '08:18',
      views: '43',
      date: '7 tahun yang lalu',
      thumbnail: 'https://img.youtube.com/vi/3-wVZm2yZy4/hqdefault.jpg',
      category: 'Tauhid',
      type: 'full',
    },
    {
      id: '2jkVGd7ldm0',
      title: 'Memahami Karakter Wanita dalam Islam',
      speaker: 'Ustadz Khalid Basalamah',
      duration: '18:20',
      views: '14',
      date: '7 tahun yang lalu',
      thumbnail: 'https://img.youtube.com/vi/2jkVGd7ldm0/hqdefault.jpg',
      category: 'Keluarga',
      type: 'full',
    },
  ];

  // Data untuk short videos
  shortVideos = [
    {
      id: '0VyFYtZE0Ac',
      title: 'Doa ketika bersin',
      speaker: 'Ust. Khalid Basalamah',
      duration: '01:00',
      views: '140',
      date: '2 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/0VyFYtZE0Ac/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'MpUOH4jbS2o',
      title: 'Imsak',
      speaker: 'Ust. Firanda Andirja',
      duration: '01:00',
      views: '14',
      date: '1 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/MpUOH4jbS2o/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'ORQIeNEgAg4',
      title: 'Tergantung tutupnya',
      speaker: 'Ust. Firanda Andirja & ust Syafiq Basalamah',
      duration: '01:00',
      views: '15',
      date: '4 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/ORQIeNEgAg4/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'WN3Y1AgonvU',
      title: 'Keutamaan Tarawih',
      speaker: 'Ust. Khalid Basalamah',
      duration: '01:00',
      views: '40',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/WN3Y1AgonvU/hqdefault.jpg',
      type: 'short',
    },
    {
      id: '11YGA57kjgs',
      title: 'Hal yang Disangka Membatalkan Puasa',
      speaker: 'Ust. Firanda Andirja',
      duration: '01:00',
      views: '22',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/11YGA57kjgs/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'rJIJ-xo6H9s',
      title: 'Bencinya perbuatannya bukan fisiknya',
      speaker: 'Ust. Khalid Basalamah',
      duration: '01:00',
      views: '30',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/rJIJ-xo6H9s/hqdefault.jpg',
      type: 'short',
    },
    {
      id: '6_OQEfW6RNc',
      title: 'Hiduplah sesuai isi dompetmu',
      speaker: 'Ust. Khalid Basalamah',
      duration: '01:00',
      views: '32',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/6_OQEfW6RNc/hqdefault.jpg',
      type: 'short',
    },
    {
      id: '9HqPxVfRIEA',
      title: 'Doa Keluar Rumah',
      speaker: 'Ust. Khalid Basalamah',
      duration: '01:00',
      views: '557',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/9HqPxVfRIEA/hqdefault.jpg',
      type: 'short',
    },
    {
      id: '7Qyk4AWsrDE',
      title: 'Bawalah 2 hal jangan bawa 2 hal',
      speaker: 'Ust. Khalid Basalamah',
      duration: '01:00',
      views: '18',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/7Qyk4AWsrDE/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'FJaKenWUEkY',
      title: 'Joker',
      speaker: 'Ust. Syafiq Basalamah',
      duration: '01:00',
      views: '33',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/FJaKenWUEkY/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'PgBN2-d-D4Q',
      title: 'Transfer pahala',
      speaker: 'Ust. Khalid Basalamah',
      duration: '01:00',
      views: '475',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/PgBN2-d-D4Q/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'ScFD_1wi02Y',
      title: 'Cara menangkal sihir',
      speaker: 'Ust. Khalid Basalamah',
      duration: '01:00',
      views: '85k',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/ScFD_1wi02Y/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'izidXdpAy40',
      title: '1 Menit untuk Allah',
      speaker: '',
      duration: '01:00',
      views: '9',
      date: '5 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/izidXdpAy40/hqdefault.jpg',
      type: 'short',
    },
  ];

  // Get all videos for search
  get allVideos() {
    return [...this.featuredVideos, ...this.fullVideos, ...this.shortVideos];
  }

  // Get filtered videos based on active filter and search
  get filteredFullVideos() {
    let videos = this.fullVideos;

    // Apply type filter
    if (
      this.activeFilter === 'notes' ||
      this.activeFilter === 'short' ||
      this.activeFilter === 'api'
    ) {
      return [];
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      videos = this.filterVideosBySearch(videos);
    }

    return videos;
  }

  get filteredShortVideos() {
    let videos = this.shortVideos;

    // Apply type filter
    if (
      this.activeFilter === 'notes' ||
      this.activeFilter === 'full' ||
      this.activeFilter === 'api'
    ) {
      return [];
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      videos = this.filterVideosBySearch(videos);
    }

    return videos;
  }

  get filteredFeaturedVideos() {
    if (this.activeFilter === 'all' || this.activeFilter === 'full') {
      let videos = this.featuredVideos.filter((video) => video.type === 'full');

      // Apply search filter
      if (this.searchQuery.trim()) {
        videos = this.filterVideosBySearch(videos);
      }

      return videos;
    }
    return [];
  }

  // Method untuk search videos
  filterVideosBySearch(videos: any[]): any[] {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return videos;

    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        video.speaker.toLowerCase().includes(query) ||
        (video.category && video.category.toLowerCase().includes(query)),
    );
  }

  filterNotesBySearch(notes: KajianNote[]): KajianNote[] {
    const query = this.normalizeSearchText(this.searchQuery);
    if (!query) return notes;

    return notes.filter((note) => {
      const [year, month, day] = note.sortDate.split('-');
      const numericDateAliases = `${note.sortDate} ${day}-${month}-${year} ${day}/${month}/${year}`;
      const searchableText = [
        note.title,
        note.speaker,
        note.date,
        numericDateAliases,
        note.location,
        note.topic,
        note.summary,
        ...note.points,
      ].join(' ');

      return this.normalizeSearchText(searchableText).includes(query);
    });
  }

  private normalizeSearchText(value: string): string {
    const englishToIndonesianMonths: Record<string, string> = {
      january: 'januari',
      february: 'februari',
      march: 'maret',
      april: 'april',
      may: 'mei',
      june: 'juni',
      july: 'juli',
      august: 'agustus',
      september: 'september',
      october: 'oktober',
      november: 'november',
      december: 'desember',
    };

    return Object.entries(englishToIndonesianMonths).reduce(
      (text, [englishMonth, indonesianMonth]) =>
        text.replace(new RegExp(`\\b${englishMonth}\\b`, 'g'), indonesianMonth),
      value.toLowerCase().trim(),
    );
  }

  // Get search results count
  get searchResultsCount(): number {
    return (
      this.filteredKajianNotes.length +
      this.filteredFullVideos.length +
      this.filteredShortVideos.length +
      (this.showApiKajian ? this.apiKajianTotal : 0)
    );
  }

  // Clear search
  clearSearch() {
    this.searchQuery = '';
    this.kajianNotesPage = 1;
    this.loadApiKajian();
  }

  onSearchChange() {
    this.kajianNotesPage = 1;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadApiKajian(), 350);
  }

  goToKajianNotesPage(page: number) {
    if (page < 1 || page > this.kajianNotesTotalPages || page === this.kajianNotesPage) return;

    this.kajianNotesPage = page;

    setTimeout(() => {
      document.getElementById('rangkuman-kajian')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  // Method untuk memutar video langsung di tempat
  playVideoInPlace(video: any) {
    this.currentVideo = video;
    this.showVideoPlayer = true;

    // Scroll ke video player
    setTimeout(() => {
      const videoPlayer = document.getElementById('video-player');
      if (videoPlayer) {
        videoPlayer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Method untuk menutup video player
  closeVideoPlayer() {
    this.showVideoPlayer = false;
    this.currentVideo = null;
  }

  // Method untuk embed URL
  getVideoUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Method untuk membuka di tab baru
  playVideoInNewTab(videoId: string) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  }

  // Filter videos by type
  filterVideos(type: string) {
    this.activeFilter = type;
    this.kajianNotesPage = 1;
  }
}
