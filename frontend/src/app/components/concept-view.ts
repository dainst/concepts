import { Directive, input } from '@angular/core';
import {Concept} from 'concepts-common/interfaces/concept';


@Directive()
export abstract class ConceptViewComponent {
  readonly concept = input.required<Concept>();
}
