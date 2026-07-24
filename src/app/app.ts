import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { TanyaAi } from './components/tanya-ai/tanya-ai';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, TanyaAi],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('y');
}
