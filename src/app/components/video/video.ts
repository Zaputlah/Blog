import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

interface KajianSchedule {
  ustadz: string;
  topic: string;
  day: string;
  time: string;
  location: string;
  platform: string;
  note: string;
  youtubeUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  group: 'blokm' | 'dynamic';
}

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

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './video.html',
  styleUrls: ['./video.css'],
})
export class Video {
  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  // Video yang sedang diputar
  currentVideo: any = null;
  showVideoPlayer: boolean = false;
  activeFilter: string = 'all';
  searchQuery: string = '';

  kajianNotes: KajianNote[] = [
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

  kajianSchedules: KajianSchedule[] = [
    {
      ustadz: 'Ustadz Muhammad Nuzul Dzikri',
      topic: 'Kajian rutin Sabtu sore',
      day: 'Setiap Sabtu',
      time: '16.30/17.00 WIB sampai menjelang adzan Maghrib',
      location: 'Masjid Nurul Iman Blok M Square lt. 7, Jakarta Selatan',
      platform: 'Offline; biasanya juga dapat dipantau melalui kanal Masjid Nurul Iman',
      note: 'Jadwal ini dikenal rutin di Blok M. Perubahan waktu, tema, atau libur kajian bisa dilihat di Instagram Masjid Nurul Iman dan media sosial Ustadz Muhammad Nuzul Dzikri.',
      youtubeUrl: 'https://www.youtube.com/@MuhammadNuzulDzikri',
      sourceUrl: 'https://www.instagram.com/masjidnuruliman/',
      sourceLabel: 'Instagram Masjid Nurul Iman',
      group: 'blokm',
    },
    {
      ustadz: 'Ustadz Khalid Basalamah',
      topic: 'Kajian rutin dan tabligh akbar',
      day: 'Rabu malam',
      time: '18.30-20.00 WIB',
      location: 'Masjid Nurul Iman Blok M Square lt. 7, Jakarta Selatan',
      platform: 'Offline; rekaman/live mengikuti pengumuman KHB Official',
      note: 'Umumnya dijadwalkan Rabu malam, baik pekanan tertentu atau dua mingguan. Perubahan waktu, tema, atau tabligh akbar dapat dipantau melalui Info KHB Official dan kanal resmi Ustadz Khalid Basalamah.',
      youtubeUrl: 'https://www.youtube.com/c/khalidbasalamah',
      sourceUrl: 'https://www.instagram.com/infokhbofficial/',
      sourceLabel: 'Instagram Info KHB Official',
      group: 'blokm',
    },
    {
      ustadz: 'Ustadz Firanda Andirja',
      topic: 'Kajian rutin dan tabligh akbar lintas lokasi',
      day: 'Selasa dan Ahad',
      time: 'Selasa ba’da Maghrib; Ahad 09.30 WIB-selesai',
      location:
        'Selasa: Masjid Baiturrahman, Pondok Pinang, Jakarta Selatan; Ahad: Masjid Jami Al-Barkah, Cileungsi, Bogor',
      platform: 'YouTube dan Facebook Ustadz Firanda Andirja Official',
      note: 'Jadwal Ustadz Firanda bersifat dinamis dan dapat berpindah lokasi. Jadwal rinci, poster kajian, tabligh akbar, dan perubahan waktu dipantau melalui kanal resmi beliau.',
      youtubeUrl: 'https://www.youtube.com/@FirandaAndirjaOfficial',
      sourceUrl: 'https://firanda.com/',
      sourceLabel: 'Website Firanda Official',
      group: 'dynamic',
    },
    {
      ustadz: 'Ustadz Syafiq Riza Basalamah',
      topic: 'Kajian tematik, tabligh akbar, dan kajian keluarga',
      day: 'Dinamis mengikuti poster resmi',
      time: 'Pagi, sore, atau malam mengikuti jadwal terbaru',
      location: 'Berpindah lokasi, antara lain Jakarta, Jember, dan kota lainnya',
      platform: 'Website resmi, YouTube, Facebook, dan SRB Apps',
      note: 'Jadwal Ustadz Syafiq bersifat dinamis dan sering berpindah tempat. Jadwal terbaru dan rekaman kajian dapat dipantau melalui website resmi serta channel YouTube Syafiq Riza Basalamah Official.',
      youtubeUrl: 'https://www.youtube.com/@SyafiqRizaBasalamahOfficial',
      sourceUrl: 'https://www.syafiqrizabasalamah.id/',
      sourceLabel: 'Website SRB Official',
      group: 'dynamic',
    },
  ];

  get filteredBlokMSchedules() {
    return this.filteredSchedules.filter((schedule) => schedule.group === 'blokm');
  }

  get filteredDynamicSchedules() {
    return this.filteredSchedules.filter((schedule) => schedule.group === 'dynamic');
  }

  get filteredKajianNotes() {
    if (
      this.activeFilter === 'schedule' ||
      this.activeFilter === 'full' ||
      this.activeFilter === 'short'
    ) {
      return [];
    }

    let notes = this.kajianNotes;

    if (this.searchQuery.trim()) {
      notes = this.filterNotesBySearch(notes);
    }

    return [...notes].sort((firstNote, secondNote) =>
      secondNote.sortDate.localeCompare(firstNote.sortDate)
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

  get filteredSchedules() {
    if (
      this.activeFilter === 'notes' ||
      this.activeFilter === 'full' ||
      this.activeFilter === 'short'
    ) {
      return [];
    }

    let schedules = this.kajianSchedules;

    if (this.searchQuery.trim()) {
      schedules = this.filterSchedulesBySearch(schedules);
    }

    return schedules;
  }

  // Get filtered videos based on active filter and search
  get filteredFullVideos() {
    let videos = this.fullVideos;

    // Apply type filter
    if (
      this.activeFilter === 'notes' ||
      this.activeFilter === 'short' ||
      this.activeFilter === 'schedule'
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
      this.activeFilter === 'schedule'
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
        (video.category && video.category.toLowerCase().includes(query))
    );
  }

  filterSchedulesBySearch(schedules: KajianSchedule[]): KajianSchedule[] {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return schedules;

    return schedules.filter(
      (schedule) =>
        schedule.ustadz.toLowerCase().includes(query) ||
        schedule.topic.toLowerCase().includes(query) ||
        schedule.day.toLowerCase().includes(query) ||
        schedule.location.toLowerCase().includes(query) ||
        schedule.platform.toLowerCase().includes(query) ||
        schedule.note.toLowerCase().includes(query)
    );
  }

  filterNotesBySearch(notes: KajianNote[]): KajianNote[] {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return notes;

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.speaker.toLowerCase().includes(query) ||
        note.date.toLowerCase().includes(query) ||
        note.location.toLowerCase().includes(query) ||
        note.topic.toLowerCase().includes(query) ||
        note.summary.toLowerCase().includes(query) ||
        note.points.some((point) => point.toLowerCase().includes(query))
    );
  }

  // Get search results count
  get searchResultsCount(): number {
    return (
      this.filteredSchedules.length +
      this.filteredKajianNotes.length +
      this.filteredFullVideos.length +
      this.filteredShortVideos.length
    );
  }

  // Clear search
  clearSearch() {
    this.searchQuery = '';
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
  }

  // Get button classes based on active filter
  getButtonClass(type: string): string {
    return this.activeFilter === type ? 'filter-button-active' : 'filter-button';
  }
}
