import {Component, computed, inject, input, ResourceRef, Signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {BackendService} from '../../services/backend.service';
import {ConceptSelector, SearchResult} from 'concepts-common/interfaces/search';
import {flatten} from '../../functions/object';
import {JsonPipe} from '@angular/common';
import {Page} from '../../interfaces/page';

@Component({
  selector: 'app-results',
  templateUrl: './results.html',
  imports: [
    JsonPipe,
    RouterLink
  ]
})
export class Results {
  readonly searchQuery = input.required<ConceptSelector>({});
  private readonly bs = inject(BackendService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly pages: Signal<Page[]> = computed(() => {
    const result = this.result.value();
    if (!result) return [];
    const offset = result.selector.offset ?? 0;
    const limit = result.selector.limit ?? Infinity;
    const current = Math.floor(offset / limit);
    const count = Math.floor(result.count / limit);
    return Array.from({length: count})
      .map((_, nr) => nr)
      .filter(nr =>
        nr <= 3
        || nr >= count - 3
        || (nr >= current - 3 && nr <= current + 3)
      )
      .map(nr => ({
        nr,
        caption: (nr === current - 3 || nr === current + 3) && count > 6 ? '…' : String(nr),
        disabled: (nr === current - 3 || nr === current + 3) && count > 6,
        current: current === nr
      }));
  });

  readonly result: ResourceRef<SearchResult|undefined> = rxResource({
    params: () => this.searchQuery(),
    stream: ({params}) => this.bs.search(params)
  });

  protected navigate(target: string | number): void {
    const sq = this.searchQuery();
    const previousOffset = sq.offset ?? 0;
    const limit = sq.limit ?? 0;
    const max = (this.result.value()?.count ?? previousOffset)  - limit;
    let offset = 0;
    if (target === 'first') {
      offset = 0;
    } else if (target === 'last') {
      offset = max;
    } else if (target === 'next') {
      offset = Math.min(max, previousOffset + limit);
    } else if (target === 'prev') {
      offset = Math.max(0, previousOffset - limit);
    } else if (typeof target === 'number' && Number.isSafeInteger(target)) {
      offset = Math.min(max, Math.max(0, target * limit));
    }
    const queryParams = flatten({...sq, offset});
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
