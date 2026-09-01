import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-speech-reader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speech-reader.html',
  styleUrl: './speech-reader.css',
})
export class SpeechReader implements OnChanges, OnDestroy {
  @Input() enabled = false;

  popupVisible = false;
  selectedText = '';
  popupLeft = 0;
  popupTop = 0;
  isSpeaking = false;
  readonly speechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  private selectionTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(): void {
    if (!this.enabled) this.stopAndHide();
  }

  ngOnDestroy(): void {
    if (this.selectionTimer) clearTimeout(this.selectionTimer);
    this.stopAndHide();
  }

  @HostListener('document:selectionchange')
  handleSelectionChange(): void {
    if (!this.enabled) return;
    if (this.selectionTimer) clearTimeout(this.selectionTimer);
    this.selectionTimer = setTimeout(() => this.captureSelection(), 40);
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  hideOnViewportChange(): void {
    this.popupVisible = false;
  }

  preserveSelection(event: PointerEvent): void {
    event.preventDefault();
  }

  speakSelection(): void {
    if (!this.speechSupported || !this.selectedText || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(this.selectedText);
    utterance.lang = this.speechLanguage(document.documentElement.lang || 'id');
    utterance.rate = 0.92;
    utterance.pitch = 1;
    const languagePrefix = utterance.lang.split('-')[0].toLowerCase();
    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) => candidate.lang.toLowerCase().startsWith(languagePrefix));
    if (voice) utterance.voice = voice;

    utterance.onend = () => (this.isSpeaking = false);
    utterance.onerror = () => (this.isSpeaking = false);
    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  private captureSelection(): void {
    if (!this.enabled || !this.speechSupported || typeof window === 'undefined') {
      this.popupVisible = false;
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      this.popupVisible = false;
      return;
    }

    const anchor = selection.anchorNode;
    const anchorElement = anchor instanceof Element ? anchor : anchor?.parentElement;
    if (!anchorElement?.closest('main')) {
      this.popupVisible = false;
      return;
    }

    const text = selection.toString().replace(/\s+/g, ' ').trim();
    if (!text) {
      this.popupVisible = false;
      return;
    }

    const range = selection.getRangeAt(0);
    const rectangles = Array.from(range.getClientRects());
    const rect = rectangles[rectangles.length - 1] || range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      this.popupVisible = false;
      return;
    }

    this.selectedText = text.slice(0, 4_000);
    this.popupLeft = Math.min(window.innerWidth - 64, Math.max(64, rect.left + rect.width / 2));
    this.popupTop = rect.bottom + 54 < window.innerHeight ? rect.bottom + 8 : Math.max(8, rect.top - 46);
    this.popupVisible = true;
  }

  private stopAndHide(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.popupVisible = false;
    this.selectedText = '';
  }

  private speechLanguage(language: string): string {
    const code = language.toLowerCase();
    if (code.startsWith('en')) return 'en-US';
    if (code.startsWith('ar')) return 'ar-SA';
    if (code.startsWith('zh')) return 'zh-CN';
    return 'id-ID';
  }
}
