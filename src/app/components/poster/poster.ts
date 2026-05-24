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

  categories = ['Semua', 'Poster Dakwah', 'Konten Instagram'];
  selectedCategory = 'Semua';

  private mainPosterFiles = ['poster1.png'];
  private instagramPosterFiles = Array.from({ length: 30 }, (_, index) => `poster${index + 1}.jpg`);

  ngOnInit() {
    this.allPosters = [...this.buildMainPosters(), ...this.buildInstagramPosters()];
    this.updateDisplayedPosters();
  }

  loadMore() {
    const filtered = this.getFilteredPosters();
    const nextLength = this.displayedPosters.length + this.pageSize;
    this.displayedPosters = filtered.slice(0, nextLength);
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.updateDisplayedPosters();
  }

  getCategoryButtonClass(category: string): string {
    return this.selectedCategory === category ? 'filter-button-active' : 'filter-button';
  }

  searchPoster(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.updateDisplayedPosters();
  }

  updateDisplayedPosters() {
    this.displayedPosters = this.getFilteredPosters().slice(0, this.initialLoadCount);
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

  private buildMainPosters(): Poster[] {
    return this.mainPosterFiles.map((fileName, index) => ({
      id: index + 1,
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
      id: this.mainPosterFiles.length + index + 1,
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
