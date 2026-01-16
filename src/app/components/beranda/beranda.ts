import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-beranda',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './beranda.html',
  styleUrls: ['./beranda.css'],
})
export class Beranda {
  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  videos = [
    {
      id: '-GwTnpO74l4',
      title: 'Doa Ketika Bersin',
      speaker: 'Ustadz Khalid Basalamah',
      duration: '07:24',
      views: '5.8K',
      date: '7 tahun yang lalu',
      thumbnail: 'https://img.youtube.com/vi/-GwTnpO74l4/hqdefault.jpg',
    },
    {
      id: '3-wVZm2yZy4',
      title: 'Yang terbaik pilihan allah',
      speaker: 'Ustadz Firanda Andirja',
      duration: '08:18',
      views: '43',
      date: '7 tahun yang lalu',
      thumbnail: 'https://img.youtube.com/vi/3-wVZm2yZy4/hqdefault.jpg',
    },
    {
      id: '2jkVGd7ldm0',
      title: 'Memahami karakter wanita dalam islam',
      speaker: 'Ustadz Khalid Basalamah',
      duration: '18:20',
      views: '14',
      date: '7 tahun yang lalu',
      thumbnail: 'https://img.youtube.com/vi/2jkVGd7ldm0/hqdefault.jpg',
    },
  ];

  // Method untuk navigasi manual
  goToVideo() {
    this.router.navigate(['/video']);
  }

  goToArtikel() {
    this.router.navigate(['/artikel']);
  }

  goToPoster() {
    this.router.navigate(['/poster']);
  }

  // Method ketika video di klik - langsung ke halaman video
  onVideoClick() {
    this.goToVideo();
  }

  // Method untuk embed URL (jika mau modal)
  getVideoUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Method untuk modal (jika diperlukan) - sekarang redirect ke halaman video
  openVideoModal(videoId: string) {
    this.onVideoClick();
  }
}
