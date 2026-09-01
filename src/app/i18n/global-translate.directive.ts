import { AfterViewInit, Directive, ElementRef, OnDestroy, effect, inject } from '@angular/core';
import { LanguageService } from './language.service';

interface TextState { source: string; applied: string; }

@Directive({ selector: '[appGlobalTranslate]', standalone: true })
export class GlobalTranslateDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly language = inject(LanguageService);
  private readonly textStates = new WeakMap<Node, TextState>();
  private observer?: MutationObserver;
  private translating = false;
  private readonly pending = new Set<string>();
  private readonly failed = new Set<string>();
  private batchTimer?: ReturnType<typeof setTimeout>;
  private batchRunning = false;

  constructor() {
    effect(() => {
      this.language.currentLanguage();
      this.failed.clear();
      queueMicrotask(() => this.translateTree(this.host.nativeElement));
    });
  }

  ngAfterViewInit(): void {
    this.translateTree(this.host.nativeElement);
    if (typeof MutationObserver === 'undefined') return;
    this.observer = new MutationObserver((mutations) => {
      if (this.translating) return;
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') this.translateTextNode(mutation.target);
        mutation.addedNodes.forEach((node) => this.translateTree(node));
      });
    });
    this.observer.observe(this.host.nativeElement, { childList: true, subtree: true, characterData: true });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.batchTimer) clearTimeout(this.batchTimer);
  }

  private translateTree(root: Node): void {
    if (typeof document === 'undefined') return;
    this.translating = true;
    if (root.nodeType === Node.TEXT_NODE) this.translateTextNode(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) this.translateTextNode(node);
    if (root instanceof Element) {
      [root, ...Array.from(root.querySelectorAll('[placeholder], [title], [aria-label]'))]
        .forEach((element) => this.translateAttributes(element));
    }
    this.translating = false;
    this.scheduleBatch();
  }

  private translateTextNode(node: Node): void {
    const parent = node.parentElement;
    if (!parent || this.shouldSkip(parent)) return;
    const current = node.textContent || '';
    if (!current.trim()) return;
    const state = this.textStates.get(node);
    const source = state && current === state.applied ? state.source : current;
    const translated = this.language.translate(source);
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    const applied = translated === source ? source : `${leading}${translated}${trailing}`;
    this.textStates.set(node, { source, applied });
    if (current !== applied) node.textContent = applied;
    this.queueUnknown(source);
  }

  private translateAttributes(element: Element): void {
    if (this.shouldSkip(element)) return;
    ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;
      const key = `data-i18n-${attribute}`;
      const source = element.getAttribute(key) || value;
      element.setAttribute(key, source);
      const translated = this.language.translate(source);
      element.setAttribute(attribute, translated);
      this.queueUnknown(source);
    });
  }

  private shouldSkip(element: Element): boolean {
    return Boolean(
      element.closest(
        '[data-no-translate], .font-arabic, .arabic-text, .arabic-question, .arabic-answer, .source-arabic, script, style, code, pre',
      ) || element.matches('[lang="ar"], [dir="rtl"]'),
    );
  }

  private queueUnknown(source: string): void {
    if (this.language.currentLanguage() === 'id' || this.language.hasTranslation(source)) return;
    const normalized = source.replace(/\s+/g, ' ').trim();
    if (
      normalized.length < 2 ||
      normalized.length > 1800 ||
      /^[\d\s.,:;()+\-–—/|%#@!?]+$/.test(normalized) ||
      /^(?:https?:\/\/|www\.|mailto:)/i.test(normalized) ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ||
      this.failed.has(this.failureKey(normalized))
    ) return;
    this.pending.add(normalized);
  }

  private scheduleBatch(): void {
    if (!this.pending.size || this.batchRunning || this.batchTimer) return;
    this.batchTimer = setTimeout(() => {
      this.batchTimer = undefined;
      void this.runBatch();
    }, 80);
  }

  private async runBatch(): Promise<void> {
    if (this.batchRunning || !this.pending.size) return;
    const language = this.language.currentLanguage();
    const batch: string[] = [];
    let totalLength = 0;
    for (const text of this.pending) {
      if (batch.length >= 30 || totalLength + text.length > 12000) break;
      batch.push(text);
      totalLength += text.length;
    }
    batch.forEach((text) => this.pending.delete(text));
    this.batchRunning = true;
    try {
      await this.language.translateBatch(batch);
      if (this.language.currentLanguage() === language) this.translateTree(this.host.nativeElement);
    } catch {
      batch.forEach((text) => this.failed.add(`${language}\0${text}`));
    } finally {
      this.batchRunning = false;
      this.scheduleBatch();
    }
  }

  private failureKey(source: string): string {
    return `${this.language.currentLanguage()}\0${source}`;
  }
}
