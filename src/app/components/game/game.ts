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
  options: string[];
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
  private readonly highScoreKey = 'zaputlah.game.highScore';

  view: 'intro' | 'playing' | 'result' = 'intro';
  questions: QuizQuestion[] = [];
  currentIndex = 0;
  score = 0;
  highScore = 0;
  selectedAnswer = '';
  answered = false;

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.highScore = Number(localStorage.getItem(this.highScoreKey)) || 0;
    }
  }

  startGame(): void {
    const selectedSurahs = this.shuffle([...this.allSurahs]).slice(0, this.questionCount);
    this.questions = selectedSurahs.map((surah) => {
      const distractors = this.shuffle(this.allSurahs.filter((item) => item.nomor !== surah.nomor))
        .slice(0, 3)
        .map((item) => item.namaLatin);

      return { surah, options: this.shuffle([surah.namaLatin, ...distractors]) };
    });

    this.currentIndex = 0;
    this.score = 0;
    this.selectedAnswer = '';
    this.answered = false;
    this.view = 'playing';
    this.scrollToGame();
  }

  selectAnswer(answer: string): void {
    if (this.answered) return;

    this.selectedAnswer = answer;
    this.answered = true;
    if (answer === this.currentQuestion.surah.namaLatin) {
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

  answerClass(option: string): string {
    if (!this.answered) return 'answer-button';
    if (option === this.currentQuestion.surah.namaLatin) return 'answer-button correct';
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
