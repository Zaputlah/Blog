import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

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
      title: 'Yang terbaik pilihan allah',
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
      title: 'Memahami karakter wanita dalam islam',
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
      speaker: 'Ust. Khalid basalamah',
      duration: '01:00',
      views: '140',
      date: '2 hari lalu',
      thumbnail: 'https://img.youtube.com/vi/0VyFYtZE0Ac/hqdefault.jpg',
      type: 'short',
    },
    {
      id: 'MpUOH4jbS2o',
      title: 'Imsak',
      speaker: 'Ust. Firanda andirja',
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
      title: 'hal yang di sangka membatalkan puasa',
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
      title: '1 Menit untuk allah',
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
    if (this.activeFilter === 'short') {
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
    if (this.activeFilter === 'full') {
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

  // Get search results count
  get searchResultsCount(): number {
    return (
      this.filteredFullVideos.length +
      this.filteredShortVideos.length +
      this.filteredFeaturedVideos.length
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
    const baseClass =
      'px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition duration-200';
    if (this.activeFilter === type) {
      return `${baseClass} bg-green-600 text-white hover:bg-green-700`;
    } else {
      return `${baseClass} bg-green-100 text-green-800 hover:bg-green-200`;
    }
  }
}
