import { Routes } from '@angular/router';
import { Beranda } from './components/beranda/beranda';
import { Video } from './components/video/video';
import { Artikel } from './components/artikel/artikel';
import { Poster, PosterComponent } from './components/poster/poster';
import { Quran } from './components/quran/quran';

export const routes: Routes = [
  { path: '', redirectTo: 'beranda', pathMatch: 'full' },
  { path: 'beranda', component: Beranda },
  { path: 'video', component: Video },
  { path: 'artikel', component: Artikel },
  { path: 'poster', component: PosterComponent },
  { path: 'quran', component: Quran },
  { path: '**', redirectTo: 'beranda' },
];
