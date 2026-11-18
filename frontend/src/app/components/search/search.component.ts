import {Component, inject, OnDestroy, Signal} from '@angular/core';
import {Results} from '../results/results';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ConceptSelector} from 'concepts-common/interfaces/search';
import {toSignal} from '@angular/core/rxjs-interop';
import {map, Subscription} from 'rxjs';
import {conceptTypes} from 'concepts-common/interfaces/concept';
import {CheckboxGroupComponent} from '../checkbox-group/checkbox-group';
import {queryParamsToConceptSelector} from 'concepts-common/functions/query-params';
import {paramMapToRecord} from '../../functions/query-params';

@Component({
  selector: 'app-search',
  imports: [
    Results,
    FormsModule,
    CheckboxGroupComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnDestroy {
  protected query: ConceptSelector = {q: ''};
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly conceptTypes = conceptTypes;

  private searchInUrl$ = this.route.queryParamMap
    .pipe(
      map(paramMapToRecord),
      map(queryParamsToConceptSelector)
    );

  readonly currentSearch: Signal<ConceptSelector> = toSignal(this.searchInUrl$, {requireSync: true});

  private readonly subscription: Subscription;

  constructor() {
    this.subscription = this.searchInUrl$
      .subscribe(lastSearch => {
        this.query = {
          ...lastSearch,
          ...(lastSearch.type && {type: !Array.isArray(lastSearch.type) ? [lastSearch.type]: lastSearch.type})
        };
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async search(): Promise<void> {
    await this.router.navigate(['search'], {
      queryParams: this.query,
      queryParamsHandling: 'merge'
    });
  }
}
