import {Component, inject, input, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {Concept, ConceptAbstract, ConceptId} from 'concepts-common/interfaces/concept';
import {JsonPipe} from '@angular/common';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';
import {NgbHighlight, NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable, of,
  OperatorFunction,
  switchMap,
  tap
} from 'rxjs';
import {Backend} from '../../services/backend';
import {ConceptSelector} from 'concepts-common/interfaces/search';
import {isConceptId} from 'concepts-common/functions/concept.typeguards';

@Component({
  selector: 'select-concept',
  templateUrl: './select-concept.html',
  imports: [
    JsonPipe,
    BootstrapFormValidationDirective,
    NgbHighlight,
    NgbTypeahead,
    ReactiveFormsModule,
    FormsModule
  ],
  styleUrl: './select-concept.css'
})
export class SelectConceptComponent implements FormValueControl<ConceptId> {
  value = model({id: '', type: 'concepts'});
  searchBase = input<ConceptSelector>({});
  private bs = inject(Backend);

  protected searching = false;
  protected searchFailed = false;

  protected searchConcept: OperatorFunction<string, readonly Concept[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap(term=>
        this.bs.search({...this.searchBase(), q: term, shards: ['title']})
          .pipe(
            tap(() => (this.searchFailed = false)),
            map(sr => sr.results),
            catchError(() => {
              this.searchFailed = true;
              return of([]);
            })
          ),
      ),
      tap(() => (this.searching = false)),
    );

  static fullId = (cId: ConceptId): string => `#${cId.type}/${cId.id}`;

  protected formatter = (x: Concept | ConceptId) =>
    isConceptId(x) ? SelectConceptComponent.fullId(x) : (x.title ?? SelectConceptComponent.fullId(x.id));
}
