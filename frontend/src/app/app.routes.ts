import {Routes} from '@angular/router';
import {ConceptComponent} from './components/concept/concept.component';
import {Results} from './components/results/results';
import {StatusComponent} from './components/page-status/status.component';
import {About} from './components/page-about/about';
import {NewConcept} from './components/concept-new/new-concept';

export const routes: Routes = [
  {path: 'pages/about', component: About},
  {path: 'pages/status', component: StatusComponent},
  {path: 'concept/:type/:id', component: ConceptComponent},
  {path: 'concept', component: NewConcept},
  {path: 'search', component: Results}
];
