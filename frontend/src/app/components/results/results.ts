import {Component, computed, inject, ResourceRef, Signal} from '@angular/core';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {Backend} from '../../services/backend';
import {ConceptSelector, SearchResult} from 'concepts-common/interfaces/search';
import {flatten} from '../../functions/object';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './results.html',
  styleUrl: './results.css',
  imports: [
    JsonPipe
  ]
})
export class Results {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly bs = inject(Backend);

  readonly pageNr = computed(() => {
    const result = this.result.value();
    if (!result) return 0;
    const offset = result.selector.offset ?? 0;
    const limit = result.selector.limit ?? Infinity;
    return Math.floor(offset / limit);
  });

  readonly result: ResourceRef<SearchResult|undefined> = rxResource({
    params: () => this.searchQuery(),
    stream: ({ params }) => this.bs.search(params)
  });

  readonly searchQuery: Signal<ConceptSelector> = toSignal(
    this.route.queryParamMap.pipe(
      map(params => {
        const q = params.get('q') ?? '*';
        const limit = parseInt(params.get('limit') ?? '10');
        const offset = parseInt(params.get('offset') ?? '0');
        return {
          limit,
          offset,
          q
        };
      })
    ),
    { requireSync: true }
  );

  protected navigate(target: string) {
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
      console.log({
        max, previousOffset , limit, offset
      })
    } else if (target === 'prev') {
      offset = Math.max(0, previousOffset - limit);
    } else if (Number.isSafeInteger(parseInt(target))) {
      offset = Math.min(max, Math.max(0, parseInt(target) * limit));
    }
    const queryParams = flatten({...sq, offset});
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
