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
    if (this.activeFilter === 'full' || this.activeFilter === 'short') {
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
    if (this.activeFilter === 'short' || this.activeFilter === 'schedule') {
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
    if (this.activeFilter === 'full' || this.activeFilter === 'schedule') {
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

  // Get search results count
  get searchResultsCount(): number {
    return (
      this.filteredSchedules.length + this.filteredFullVideos.length + this.filteredShortVideos.length
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
