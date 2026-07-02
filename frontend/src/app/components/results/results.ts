import {Component, computed, inject, ResourceRef, Signal} from '@angular/core';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {Backend} from '../../services/backend';
import {SearchQuery, SearchResult} from 'concepts-common/src/interfaces/search';
import {flatten} from '../../functions/object';

@Component({
  selector: 'app-search',
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly bs = inject(Backend);

  readonly pageNr = computed(() => {
    const result = this.result.value();
    if (!result) return 0;
    return 'c:' + result.offset / result.limit;
  });

  readonly result: ResourceRef<SearchResult|undefined> = rxResource({
    params: () => this.searchQuery(),
    stream: ({ params }) => this.bs.search(params)
  });

  searchQuery: Signal<SearchQuery> = toSignal(
    this.route.queryParamMap.pipe(
      map(params => {
        const q = params.get('q') ?? '*';
        const limit = parseInt(params.get('limit') ?? '10');
        const offset = parseInt(params.get('offset') ?? '0');
        return {
          limit,
          offset,
          selector: {q}
        };
      })
    ),
    { requireSync: true }
  );

  protected navigate(target: string) {
    const sq = this.searchQuery();
    const max = (this.result.value()?.count ?? sq.offset)  - sq.limit;
    let offset = 0;
    if (target === 'first') {
      offset = 0;
    } else if (target === 'last') {
      offset = max;
    } else if (target === 'next') {
      offset = Math.min(max, sq.offset + sq.limit);
    } else if (target === 'prev') {
      offset = Math.max(0, sq.offset - sq.limit);
    } else if (Number.isSafeInteger(parseInt(target))) {
      offset = Math.min(max, Math.max(0, parseInt(target) * sq.limit));
    }
    const queryParams = flatten({...sq, offset});
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
