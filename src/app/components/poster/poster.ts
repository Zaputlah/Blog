import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Poster {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  categoryTextColor: string;
}

@Component({
  selector: 'app-poster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poster.html',
  styleUrls: ['./poster.css'],
})
export class PosterComponent implements OnInit {
  baseImagePath = '/img/';

  posters: Poster[] = [
    {
      id: 1,
      title: 'Perselisihan',
      category: 'Hadits',
      imageUrl: this.baseImagePath + 'poster1.png',
      description: 'Perselisihan Umat Islam',
      categoryTextColor: 'text-blue-800',
    },
    {
      id: 2,
      title: 'Islam sudah sempurna',
      category: 'Ayat Quran',
      imageUrl: this.baseImagePath + 'poster2.png',
      description: 'Islam Sempurna',
      categoryTextColor: 'text-purple-800',
    },
    {
      id: 3,
      title: 'Cinta Nabi',
      category: 'Ayat Quran',
      imageUrl: this.baseImagePath + 'poster3.png',
      description: 'Cinta kepada Nabi Muhammad',
      categoryTextColor: 'text-purple-800',
    },
    {
      id: 4,
      title: '"Bacalah Dengan Nama Tuhanmu"',
      category: 'Ayat Quran',
      imageUrl: this.baseImagePath + 'poster4.png',
      description: 'QS. Al-Alaq: 1',
      categoryTextColor: 'text-purple-800',
    },
  ];

  morePosters: Poster[] = [
    {
      id: 5,
      title: 'Keutamaan Shalat 5 Waktu',
      category: 'Infografis',
      imageUrl: this.baseImagePath + 'poster5.png',
      description: 'Pilar Agama',
      categoryTextColor: 'text-cyan-800',
    },
    {
      id: 6,
      title: 'Surat Al-Fatihah',
      category: 'Ayat Quran',
      imageUrl: this.baseImagePath + 'poster6.png',
      description: 'Ummul Kitab',
      categoryTextColor: 'text-pink-800',
    },
    {
      id: 7,
      title: 'Surat Al-Fatihah',
      category: 'Ayat Quran',
      imageUrl: this.baseImagePath + 'poster7.png',
      description: 'Ummul Kitab',
      categoryTextColor: 'text-pink-800',
    },
  ];

  displayedPosters: Poster[] = [];
  initialLoadCount = 8;
  searchTerm = '';
  allPosters: Poster[] = [];

  categories = ['Semua', 'Quote Islami', 'Ayat Quran', 'Kaligrafi', 'Infografis'];
  selectedCategory = 'Semua';

  ngOnInit() {
    // Gabungkan semua poster
    this.allPosters = [...this.posters, ...this.morePosters];
    this.loadInitialPosters();
  }

  loadInitialPosters() {
    this.displayedPosters = this.allPosters.slice(0, this.initialLoadCount);
  }

  loadMore() {
    const currentLength = this.displayedPosters.length;
    const nextBatch = this.allPosters.slice(currentLength, currentLength + 4);

    if (nextBatch.length > 0) {
      this.displayedPosters = [...this.displayedPosters, ...nextBatch];
    }
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.updateDisplayedPosters();
  }

  searchPoster(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.updateDisplayedPosters();
  }

  updateDisplayedPosters() {
    let filtered = this.allPosters;

    if (this.selectedCategory !== 'Semua') {
      filtered = filtered.filter((poster) => poster.category === this.selectedCategory);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(
        (poster) =>
          poster.title.toLowerCase().includes(this.searchTerm) ||
          poster.description.toLowerCase().includes(this.searchTerm) ||
          poster.category.toLowerCase().includes(this.searchTerm)
      );
    }

    this.displayedPosters = filtered.slice(0, this.initialLoadCount);
  }

  downloadPoster(poster: Poster) {
    const link = document.createElement('a');
    link.href = poster.imageUrl;
    link.download = `${poster.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  toggleFavorite(poster: Poster) {
    console.log(`Toggling favorite for: ${poster.title}`);
  }

  handleImageError(event: any, poster: Poster) {
    event.target.src =
      'https://via.placeholder.com/1240x1754/3B82F6/FFFFFF?text=' +
      encodeURIComponent(poster.title);
  }

  // TAMBAHKAN METHOD INI UNTUK CATEGORY BADGE
  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Infografis':
        return 'bg-blue-100 text-blue-800';
      case 'Ayat Quran':
        return 'bg-purple-100 text-purple-800';
      case 'Quote Islami':
        return 'bg-green-100 text-green-800';
      case 'Kaligrafi':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
