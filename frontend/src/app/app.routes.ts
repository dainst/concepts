import {Routes} from '@angular/router';
import {ConceptComponent} from './components/concept/concept.component';
import {StatusComponent} from './components/page-status/status.component';
import {About} from './components/page-about/about';
import {NewConcept} from './components/concept-new/new-concept';
import {SearchComponent} from './components/search/search.component';

export const routes: Routes = [
  {path: 'pages/about', component: About},
  {path: 'pages/status', component: StatusComponent},
  {path: 'concept/:type/:id', component: ConceptComponent},
  {path: 'concept', component: NewConcept},
  {path: 'search', component: SearchComponent}
];
