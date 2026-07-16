import {ConceptViewComponent} from '../components/concept-view';
import {Type} from '@angular/core';

export interface ConceptMenuEntry {
  id: string;
  label: string;
  disabled?: boolean;
  component: Type<ConceptViewComponent>
}
