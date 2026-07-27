import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import surahData from '../json/surah.json';

interface SurahQuizItem {
  nomor: number;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
}

interface QuizQuestion {
  surah: SurahQuizItem;
  type: QuestionType;
  label: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

type QuestionType =
  | 'meaning-to-name'
  | 'name-to-meaning'
  | 'verse-count'
  | 'revelation-place'
  | 'surah-number'
  | 'continue-verse';

type GameMode = 'mixed' | 'meaning' | 'verse-count' | 'continue-verse';

interface GameModeOption {
  id: GameMode;
  title: string;
  description: string;
  icon: string;
}

interface VerseItem {
  nomorAyat: number;
  teksArab: string;
}

interface VerseSource {
  surah: SurahQuizItem;
  verses: VerseItem[];
}

interface VersePair {
  surah: SurahQuizItem;
  currentVerse: VerseItem;
  nextVerse: VerseItem;
  verses: VerseItem[];
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.html',
  styleUrls: ['./game.css'],
})
export class Game implements OnInit {
  private readonly allSurahs = surahData.data as SurahQuizItem[];
  private readonly questionCount = 10;
  private readonly highScoreKeyPrefix = 'zaputlah.game.highScore';
  private verseSources: VerseSource[] = [];
  private readonly verseSourceCache = new Map<number, VerseSource>();

  readonly gameModes: GameModeOption[] = [
    {
      id: 'meaning',
      title: 'Tebak Arti',
      description: 'Pilih arti yang tepat dari nama surah.',
      icon: 'Aa',
    },
    {
      id: 'verse-count',
      title: 'Jumlah Ayat',
      description: 'Tebak jumlah ayat dalam setiap surah.',
      icon: '123',
    },
    {
      id: 'continue-verse',
      title: 'Sambung Ayat',
      description: 'Sambungkan ayat dari seluruh Al-Quran.',
      icon: '۞',
    },
    {
      id: 'mixed',
      title: 'Kuis Campuran',
      description: 'Mainkan semua jenis pertanyaan secara acak.',
      icon: '✦',
    },
  ];

  view: 'intro' | 'playing' | 'result' = 'intro';
  questions: QuizQuestion[] = [];
  currentIndex = 0;
  score = 0;
  highScore = 0;
  selectedAnswer = '';
  answered = false;
  selectedMode: GameMode = 'mixed';
  loadingGame = false;

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.loadHighScore();
    }
  }

  selectMode(mode: GameMode): void {
    this.selectedMode = mode;
    this.loadHighScore();
  }

  async startGame(): Promise<void> {
    if (this.loadingGame) return;

    this.loadingGame = true;
    const selectedSurahs = this.shuffle([...this.allSurahs]).slice(0, this.questionCount);
    const questionTypes = this.createQuestionTypes();
    const needsVerseData = questionTypes.includes('continue-verse');
    const verseQuestionCount = questionTypes.filter((type) => type === 'continue-verse').length;

    if (needsVerseData) {
      await this.loadVerseSources(verseQuestionCount);
    }

    const versePairs = this.createVersePairs(verseQuestionCount);

    this.questions = selectedSurahs.map((surah, index) => {
      const type = questionTypes[index];
      const versePair = type === 'continue-verse' ? versePairs.pop() : undefined;
      return this.createQuestion(surah, type, versePair);
    });

    this.currentIndex = 0;
    this.score = 0;
    this.selectedAnswer = '';
    this.answered = false;
    this.view = 'playing';
    this.loadingGame = false;
    this.scrollToGame();
  }

  selectAnswer(answer: string): void {
    if (this.answered) return;

    this.selectedAnswer = answer;
    this.answered = true;
    if (answer === this.currentQuestion.correctAnswer) {
      this.score += 10;
    }
  }

  nextQuestion(): void {
    if (!this.answered) return;

    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex += 1;
      this.selectedAnswer = '';
      this.answered = false;
      return;
    }

    this.finishGame();
  }

  backToIntro(): void {
    this.view = 'intro';
    this.questions = [];
  }

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentIndex];
  }

  get progress(): number {
    return ((this.currentIndex + 1) / this.questionCount) * 100;
  }

  get resultMessage(): string {
    if (this.score === 100) return 'MasyaAllah, sempurna!';
    if (this.score >= 70) return 'Bagus sekali, lanjutkan!';
    if (this.score >= 40) return 'Awal yang baik!';
    return 'Terus belajar dan coba lagi!';
  }

  get selectedModeTitle(): string {
    return this.gameModes.find((mode) => mode.id === this.selectedMode)?.title ?? 'Kuis';
  }

  answerClass(option: string): string {
    if (!this.answered) return 'answer-button';
    if (option === this.currentQuestion.correctAnswer) return 'answer-button correct';
    if (option === this.selectedAnswer) return 'answer-button wrong';
    return 'answer-button muted';
  }

  private finishGame(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.highScoreKey, String(this.highScore));
      }
    }
    this.view = 'result';
    this.scrollToGame();
  }

  private createQuestionTypes(): QuestionType[] {
    if (this.selectedMode === 'meaning') {
      return Array.from({ length: this.questionCount }, () => 'name-to-meaning');
    }
    if (this.selectedMode === 'verse-count') {
      return Array.from({ length: this.questionCount }, () => 'verse-count');
    }
    if (this.selectedMode === 'continue-verse') {
      return Array.from({ length: this.questionCount }, () => 'continue-verse');
    }

    return this.shuffle<QuestionType>([
      'meaning-to-name',
      'name-to-meaning',
      'verse-count',
      'verse-count',
      'revelation-place',
      'revelation-place',
      'surah-number',
      'surah-number',
      'continue-verse',
      'continue-verse',
    ]);
  }

  private get highScoreKey(): string {
    return `${this.highScoreKeyPrefix}.${this.selectedMode}`;
  }

  private loadHighScore(): void {
    if (typeof localStorage !== 'undefined') {
      this.highScore = Number(localStorage.getItem(this.highScoreKey)) || 0;
    }
  }

  private createQuestion(
    surah: SurahQuizItem,
    type: QuestionType,
    versePair?: VersePair,
  ): QuizQuestion {
    switch (type) {
      case 'continue-verse':
        return this.createContinueVerseQuestion(versePair ?? this.createVersePairs(1)[0]);
      case 'name-to-meaning':
        return this.buildQuestion(
          surah,
          type,
          'Apa arti dari surah berikut?',
          surah.namaLatin,
          surah.arti,
          (item) => item.arti,
        );
      case 'verse-count':
        return this.buildQuestion(
          surah,
          type,
          'Berapa jumlah ayat dalam surah berikut?',
          surah.namaLatin,
          `${surah.jumlahAyat} ayat`,
          (item) => `${item.jumlahAyat} ayat`,
        );
      case 'revelation-place':
        return this.buildQuestion(
          surah,
          type,
          'Di manakah surah berikut diturunkan?',
          surah.namaLatin,
          surah.tempatTurun,
          (item) => item.tempatTurun,
        );
      case 'surah-number':
        return this.buildQuestion(
          surah,
          type,
          'Berapakah nomor urut surah berikut?',
          surah.namaLatin,
          `Surah ke-${surah.nomor}`,
          (item) => `Surah ke-${item.nomor}`,
        );
      default:
        return this.buildQuestion(
          surah,
          type,
          'Surah apakah yang memiliki arti:',
          `“${surah.arti}”`,
          surah.namaLatin,
          (item) => item.namaLatin,
        );
    }
  }

  private createContinueVerseQuestion(pair: VersePair): QuizQuestion {
    const { surah, currentVerse, nextVerse, verses } = pair;
    const distractors = this.shuffle(
      verses.filter(
        (verse) => verse.nomorAyat !== currentVerse.nomorAyat && verse.nomorAyat !== nextVerse.nomorAyat,
      ),
    )
      .slice(0, 3)
      .map((verse) => verse.teksArab);

    return {
      surah,
      type: 'continue-verse',
      label: `Lanjutkan Surah ${surah.namaLatin} ayat ${currentVerse.nomorAyat}:`,
      prompt: currentVerse.teksArab,
      correctAnswer: nextVerse.teksArab,
      options: this.shuffle([nextVerse.teksArab, ...distractors]),
    };
  }

  private async loadVerseSources(count: number): Promise<void> {
    const allSurahNumbers = Array.from({ length: 114 }, (_, index) => index + 1);
    const selectedNumbers = this.shuffle(allSurahNumbers).slice(0, Math.min(count, 10));
    const results = await Promise.allSettled(
      selectedNumbers.map((surahNumber) => this.loadVerseSource(surahNumber)),
    );
    const loadedSources = results
      .filter((result): result is PromiseFulfilledResult<VerseSource> => result.status === 'fulfilled')
      .map((result) => result.value);

    this.verseSources = loadedSources.length > 0 ? loadedSources : await this.loadFallbackVerseSources();
  }

  private async loadVerseSource(surahNumber: number): Promise<VerseSource> {
    const cachedSource = this.verseSourceCache.get(surahNumber);
    if (cachedSource) return cachedSource;

    const response = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
    if (!response.ok) {
      throw new Error(`Gagal memuat surah ${surahNumber}`);
    }

    const payload = (await response.json()) as {
      data: SurahQuizItem & { ayat: VerseItem[] };
    };
    const source = { surah: payload.data, verses: payload.data.ayat };
    this.verseSourceCache.set(surahNumber, source);
    return source;
  }

  private async loadFallbackVerseSources(): Promise<VerseSource[]> {
    const modules = await Promise.all([
      import('../json/1.json'),
      import('../json/2.json'),
      import('../json/3.json'),
      import('../json/4.json'),
    ]);

    return modules.map((module) => {
      const data = module.default.data as SurahQuizItem & { ayat: VerseItem[] };
      return { surah: data, verses: data.ayat };
    });
  }

  private createVersePairs(count: number): VersePair[] {
    const pairs: VersePair[] = [];

    while (pairs.length < count) {
      for (const source of this.shuffle([...this.verseSources])) {
        if (pairs.length >= count) break;
        const currentIndex = Math.floor(Math.random() * (source.verses.length - 1));
        pairs.push({
          surah: source.surah,
          currentVerse: source.verses[currentIndex],
          nextVerse: source.verses[currentIndex + 1],
          verses: source.verses,
        });
      }
    }

    return pairs;
  }

  private buildQuestion(
    surah: SurahQuizItem,
    type: QuestionType,
    label: string,
    prompt: string,
    correctAnswer: string,
    answerFrom: (item: SurahQuizItem) => string,
  ): QuizQuestion {
    const otherAnswers = this.shuffle(
      [...new Set(this.allSurahs.filter((item) => item.nomor !== surah.nomor).map(answerFrom))],
    )
      .filter((answer) => answer !== correctAnswer)
      .slice(0, 3);

    return {
      surah,
      type,
      label,
      prompt,
      correctAnswer,
      options: this.shuffle([correctAnswer, ...otherAnswers]),
    };
  }

  private shuffle<T>(items: T[]): T[] {
    for (let index = items.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }
    return items;
  }

  private scrollToGame(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() =>
        document.getElementById('game-area')?.scrollIntoView({ behavior: 'smooth' }),
      );
    }
  }
}
