import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { timeout } from 'rxjs';

type AiScope = 'IN_SCOPE' | 'OUT_OF_SCOPE' | 'UNCLEAR';
type AiRisk = 'NORMAL' | 'RELIGIOUS_RULING' | 'MENTAL_HEALTH_CRISIS';

interface AiClassification {
  scope: AiScope;
  risk: AiRisk;
  topics: string[];
}

interface AiSource {
  id: string;
  type: 'quran' | 'hadits' | 'doa' | 'site' | 'schedule';
  title: string;
  reference: string;
  content: string;
  arabic?: string;
  latin?: string;
  url: string;
}

interface AiAskResponse {
  answer: string;
  classification: AiClassification;
  sources: AiSource[];
}

@Component({
  selector: 'app-tanya-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './tanya-ai.html',
  styleUrls: ['./tanya-ai.css'],
})
export class TanyaAi {
  @ViewChild('questionInput') questionInput?: ElementRef<HTMLTextAreaElement>;

  readonly maxLength = 500;
  readonly examples = [
    'Saya sedang sedih, ada doa atau ayat yang bisa saya baca?',
    'Carikan hadis tentang menjaga lisan.',
    'Ayat Al-Quran tentang sabar menghadapi ujian.',
  ];

  question = '';
  lastQuestion = '';
  isOpen = false;
  loading = false;
  error = '';
  result: AiAskResponse | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  open(): void {
    this.isOpen = true;
    setTimeout(() => this.questionInput?.nativeElement.focus(), 0);
  }

  close(): void {
    this.isOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.isOpen) this.close();
  }

  ask(): void {
    const question = this.question.normalize('NFKC').trim().replace(/\s+/g, ' ');
    if (question.length < 3 || question.length > this.maxLength || this.loading) return;

    this.loading = true;
    this.lastQuestion = question;
    this.question = '';
    this.error = '';
    this.result = null;
    this.cdr.markForCheck();

    this.http
      .post<AiAskResponse>('/api/ai/ask', { question, context: this.requestContext() })
      .pipe(timeout(45000))
      .subscribe({
        next: (response) => {
          this.result = response;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse | any) => {
          this.error = this.errorMessage(error);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  useExample(example: string): void {
    this.question = example;
    this.error = '';
    setTimeout(() => this.questionInput?.nativeElement.focus(), 0);
  }

  startNewQuestion(): void {
    this.question = '';
    this.lastQuestion = '';
    this.result = null;
    this.error = '';
    setTimeout(() => this.questionInput?.nativeElement.focus(), 0);
  }

  sourceLabel(type: AiSource['type']): string {
    if (type === 'quran') return 'Al-Quran';
    if (type === 'hadits') return 'Hadis';
    if (type === 'site') return 'Zaputlah';
    if (type === 'schedule') return 'Jadwal Sholat';
    return 'Doa';
  }

  trackSource(index: number, source: AiSource): string {
    return source.id;
  }

  private errorMessage(error: HttpErrorResponse | any): string {
    if (error.name === 'TimeoutError') {
      return 'Jawaban membutuhkan waktu terlalu lama. Silakan coba lagi.';
    }
    if (typeof error.error?.message === 'string') return error.error.message;
    if (error.status === 0) return 'Tidak dapat terhubung ke layanan Tanya Zaputlah.';
    return 'Tanya Zaputlah belum dapat menjawab. Silakan coba lagi.';
  }

  private requestContext(): {
    prayerLocation?: { province: string; city: string };
    localDate: string;
  } {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`;
    if (typeof localStorage === 'undefined') return { localDate };
    try {
      const stored = localStorage.getItem('zaputlah.prayerLocation');
      const location = stored
        ? (JSON.parse(stored) as { province?: unknown; city?: unknown })
        : null;
      if (typeof location?.province === 'string' && typeof location.city === 'string') {
        return {
          localDate,
          prayerLocation: { province: location.province, city: location.city },
        };
      }
    } catch {
      // Abaikan data lokasi lokal yang tidak valid.
    }
    return { localDate };
  }
}
