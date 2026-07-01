import { Directive, input } from '@angular/core';
import {Concept} from './concept/concept';

@Directive()
export abstract class ConceptViewComponent {
  title = input.required<Concept>();
}
