import {ConceptViewComponent} from '../components/concept-view';
import {Type} from '@angular/core';

export interface ConceptMenuEntry {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  component: Type<ConceptViewComponent>
}
