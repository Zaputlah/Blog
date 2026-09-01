import { Component, OnInit } from '@angular/core';
import { SpeechReader } from '../speech-reader/speech-reader';

interface AccessibilityPreferences {
  textScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  speechReaderEnabled: boolean;
}

@Component({
  selector: 'app-accessibility-menu',
  standalone: true,
  imports: [SpeechReader],
  templateUrl: './accessibility-menu.html',
  styleUrl: './accessibility-menu.css',
})
export class AccessibilityMenu implements OnInit {
  private readonly storageKey = 'zaputlah.accessibility';

  textScale = 100;
  highContrast = false;
  reducedMotion = false;
  speechReaderEnabled = false;
  announcement = '';

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || 'null') as
          | Partial<AccessibilityPreferences>
          | null;
        if (saved) {
          this.textScale = this.clampScale(saved.textScale);
          this.highContrast = saved.highContrast === true;
          this.reducedMotion = saved.reducedMotion === true;
          this.speechReaderEnabled = saved.speechReaderEnabled === true;
        }
      } catch {
        // Gunakan preferensi awal bila penyimpanan browser tidak dapat dibaca.
      }
    }
    this.applyPreferences(false);
  }

  changeTextScale(amount: number): void {
    this.textScale = this.clampScale(this.textScale + amount);
    this.announcement = `Ukuran teks ${this.textScale} persen`;
    this.applyPreferences();
  }

  toggleHighContrast(): void {
    this.highContrast = !this.highContrast;
    this.announcement = `Kontras tinggi ${this.highContrast ? 'aktif' : 'nonaktif'}`;
    this.applyPreferences();
  }

  toggleReducedMotion(): void {
    this.reducedMotion = !this.reducedMotion;
    this.announcement = `Kurangi animasi ${this.reducedMotion ? 'aktif' : 'nonaktif'}`;
    this.applyPreferences();
  }

  toggleSpeechReader(): void {
    this.speechReaderEnabled = !this.speechReaderEnabled;
    this.announcement = `Pembaca teks pilihan ${this.speechReaderEnabled ? 'aktif' : 'nonaktif'}`;
    this.applyPreferences();
  }

  reset(): void {
    this.textScale = 100;
    this.highContrast = false;
    this.reducedMotion = false;
    this.speechReaderEnabled = false;
    this.announcement = 'Pengaturan aksesibilitas direset';
    this.applyPreferences();
  }

  private applyPreferences(save = true): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.fontSize = `${this.textScale}%`;
      root.classList.toggle('a11y-high-contrast', this.highContrast);
      root.classList.toggle('a11y-reduced-motion', this.reducedMotion);
      root.classList.toggle('a11y-large-text', this.textScale > 100);
    }

    if (save && typeof localStorage !== 'undefined') {
      const preferences: AccessibilityPreferences = {
        textScale: this.textScale,
        highContrast: this.highContrast,
        reducedMotion: this.reducedMotion,
        speechReaderEnabled: this.speechReaderEnabled,
      };
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(preferences));
      } catch {
        // Pengaturan tetap aktif untuk sesi berjalan jika penyimpanan tidak tersedia.
      }
    }
  }

  private clampScale(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 100;
    return Math.min(200, Math.max(100, Math.round(value / 10) * 10));
  }
}
