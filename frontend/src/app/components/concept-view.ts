import { Directive, input } from '@angular/core';
import {Concept} from 'concepts-common/src/interfaces/concept';


@Directive()
export abstract class ConceptViewComponent {
  concept = input.required<Concept>();
}
