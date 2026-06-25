import { Routes } from '@angular/router';
import {About} from './components/pages/about/about';
import {Status} from './components/pages/status/status';

export const routes: Routes = [
  { path: 'pages/about', component: About },
  { path: 'pages/status', component: Status },
];
