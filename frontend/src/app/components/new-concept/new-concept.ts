import {Component} from '@angular/core';
import {ConceptViewEdit} from '../concept-view-edit/concept-view-edit';
import {Concept} from 'concepts-common/interfaces/concept';

@Component({
  selector: 'app-new-concept',
  imports: [
    ConceptViewEdit
  ],
  templateUrl: './new-concept.html',
  styleUrl: './new-concept.css'
})
export class NewConcept {
  protected newConcept: Concept = {
    domain: 'default',
    id: {
      id: '',
      type: ''
    }
  };
}
