import {Component, inject, OnDestroy, Signal, ViewChild} from '@angular/core';
import {Results} from '../results/results';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ConceptSelector} from 'concepts-common/interfaces/search';
import {toSignal} from '@angular/core/rxjs-interop';
import {map, startWith, Subscription} from 'rxjs';
import {conceptTypes} from 'concepts-common/interfaces/concept';
import {CheckboxGroupComponent} from '../checkbox-group/checkbox-group';
import {queryParamsToConceptSelector} from 'concepts-common/functions/query-params';
import {paramMapToRecord} from '../../functions/query-params';
import {CheckboxGroupOption} from '../../interfaces/checkbox-group';
import {DomainService} from '../../services/domain.service';
import {Domain} from 'concepts-common/interfaces/domain';
import {
  NgbAccordionBody, NgbAccordionButton, NgbAccordionCollapse,
  NgbAccordionDirective, NgbAccordionHeader, NgbAccordionItem
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-search',
  imports: [
    Results,
    FormsModule,
    CheckboxGroupComponent,
    NgbAccordionItem,
    NgbAccordionDirective,
    NgbAccordionCollapse,
    NgbAccordionButton,
    NgbAccordionHeader,
    NgbAccordionBody
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnDestroy {
  protected query: ConceptSelector = {q: ''};
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private ds = inject(DomainService);
  @ViewChild('filters') filtersAcc!: NgbAccordionDirective;

  private static domainsToOptions = (domains: Domain[]): CheckboxGroupOption[] =>
    domains.map(domain => ({
      label: domain.root ?? domain.id,
      value: domain.id,
      children: SearchComponent.domainsToOptions(domain.subDomains ?? [])
    }));

  readonly conceptTypes = conceptTypes
    .map((type: string): CheckboxGroupOption => ({label: type, value: type}));
  readonly domains =
    toSignal(
      this.ds.domains$.pipe(
        startWith([]),
        map(SearchComponent.domainsToOptions)
      ),
      {requireSync: true}
    );

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
          ...(lastSearch.type && {type: !Array.isArray(lastSearch.type) ? [lastSearch.type]: lastSearch.type}),
          ...(lastSearch.domain && {domain: !Array.isArray(lastSearch.domain) ? [lastSearch.domain]: lastSearch.domain})
        };

        if (!this.filtersAcc) return;
        this.filtersAcc[this.query.domain && this.query.domain.length ? 'expand' : 'collapse']('domain');
        this.filtersAcc[this.query.type && this.query.type.length ? 'expand' : 'collapse']('type');
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
