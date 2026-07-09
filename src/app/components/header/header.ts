import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  isMobileMenuOpen = false;
  theme: 'light' | 'dark' = 'light';

  ngOnInit(): void {
    this.theme = this.getInitialTheme();
    this.applyTheme();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();

    if (this.isBrowser()) {
      localStorage.setItem('zaputlah.theme', this.theme);
    }
  }

  get isDarkMode(): boolean {
    return this.theme === 'dark';
  }

  private getInitialTheme(): 'light' | 'dark' {
    if (!this.isBrowser()) {
      return 'light';
    }

    const savedTheme = localStorage.getItem('zaputlah.theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.toggle('dark', this.isDarkMode);
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
