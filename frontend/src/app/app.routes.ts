import { Routes } from '@angular/router';
import {About} from './components/pages/about/about';
import {StatusComponent} from './components/pages/status/status.component';
import {ConceptComponent} from './components/concept/concept.component';
import {Results} from './components/results/results';

export const routes: Routes = [
  { path: 'pages/about', component: About },
  { path: 'pages/status', component: StatusComponent },
  { path: 'concept/:type/:id', component: ConceptComponent },
  { path: 'search', component: Results },
];
