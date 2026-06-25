import { Routes } from '@angular/router';
import {About} from './components/pages/about/about';
import {StatusComponent} from './components/pages/status/status.component';

export const routes: Routes = [
  { path: 'pages/about', component: About },
  { path: 'pages/status', component: StatusComponent },
];
