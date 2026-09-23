import {Component, ElementRef, inject, input, model, signal, ViewChild} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {ConceptId} from 'concepts-common/interfaces/concept';
import {AsyncPipe} from '@angular/common';
import {NgbHighlight, NgbTypeahead, NgbTypeaheadSelectItemEvent} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  OperatorFunction,
  switchMap,
  tap
} from 'rxjs';
import {Backend} from '../../services/backend';
import {ConceptSelector} from 'concepts-common/interfaces/search';
import {TitleService} from '../../services/title';
import {TitlePipe} from '../../pipes/title-pipe';
import {stringifyId} from 'concepts-common/functions/concept-id';

@Component({
  selector: 'select-concept',
  templateUrl: './select-concept.html',
  imports: [
    NgbHighlight,
    NgbTypeahead,
    ReactiveFormsModule,
    FormsModule,
    TitlePipe,
    AsyncPipe
  ],
  styleUrl: './select-concept.css'
})
export class SelectConceptComponent implements FormValueControl<ConceptId> {
  private bs = inject(Backend);
  private ts = inject(TitleService);
  value = model<ConceptId>({id: '', type: ''});
  searchBase = input<ConceptSelector>({});
  protected searching = signal(false);
  protected selected = signal<ConceptId|null>(null);
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  private oldValue: ConceptId = {id: '', type: ''};

  protected searchConcept: OperatorFunction<string, readonly ConceptId[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching.set(true)),
      switchMap(term=>
        this.bs.search({...this.searchBase(), quickConcept: term, shards: ['title']})
          .pipe(
            map(sr => sr.results
              .map(c => {
                this.ts.set(c);
                return c.id;
              })
            )
          )
      ),
      tap(() => {
        this.searching.set(false);
      })
    );

  protected inputFormatter = (cId: ConceptId | undefined): string =>
    (!cId || !cId.id || !cId.type) ? '' : stringifyId(cId);

  protected async select(event: NgbTypeaheadSelectItemEvent<ConceptId>): Promise<void> {
    this.selected.set(event.item);
  }

  protected deselect(): void {
    this.oldValue = {...this.value()};
    this.value.set({id: '', type: ''});

    setTimeout((): void => {
      this.input?.nativeElement.focus();
    });
  }

  protected reselect(): void {
    this.value.set(this.oldValue);
  }
}
