import { Routes } from '@angular/router';
import { Beranda } from './components/beranda/beranda';
import { Video } from './components/video/video';
import { Artikel } from './components/artikel/artikel';
import { Poster, PosterComponent } from './components/poster/poster';
import { Quran } from './components/quran/quran';
import { Doa } from './components/doa/doa';

export const routes: Routes = [
  { path: '', redirectTo: 'beranda', pathMatch: 'full' },
  { path: 'beranda', component: Beranda },
  { path: 'kajian', component: Video },
  { path: 'video', redirectTo: 'kajian', pathMatch: 'full' },
  { path: 'artikel', component: Artikel },
  { path: 'poster', component: PosterComponent },
  { path: 'quran', component: Quran },
  { path: 'doa', component: Doa },
  { path: '**', redirectTo: 'beranda' },
];
