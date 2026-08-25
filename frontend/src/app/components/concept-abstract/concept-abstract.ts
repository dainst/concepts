import {Component, inject, Signal} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {Backend} from '../../services/backend';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import { ConceptId} from 'concepts-common/interfaces/concept';
import {SearchResult} from 'concepts-common/interfaces/search';

@Component({
  selector: 'app-concept-abstract',
  imports: [],
  templateUrl: './concept-abstract.html',
  styleUrl: './concept-abstract.css',
})
export class ConceptAbstract extends ConceptViewComponent {
  private readonly bs = inject(Backend);

  /**
   * we load the titles of every id and related concept with their own call
   * that might seem counterintuitive at first glance,
   * *but* that makes it use the browser cache,
   * so labels which are needed quite often, are automatically cached without us
   * having to build our own cache
   * TODO move this to conceptComponent, so the other views can use titles as well
   */
  protected readonly titles: Signal<{[type: string]: {[id: string]: string}}|undefined> = toSignal(
    toObservable(this.concept)
      .pipe(
        switchMap(concept =>
          forkJoin(
            (concept.relations ?? [])
              .flatMap(rel => [
                this.getTitle(rel.relation),
                ...rel.objects.map(obj => this.getTitle(obj))
              ])
          )
        ),
        map(
          responses => responses
            .reduce(
              (map, response) => {
                response.results
                  .forEach(result => {
                    if (!(result.id.type in map)) map[result.id.type] = {};
                    map[result.id.type][result.id.id] = result.title ?? `#${result.id.type}/${result.id.id}`
                  });
                return map;
              },
              <{[type: string]: {[id: string]: string}}>{}
            )
        )
    )
  );

  protected getTitle(id: ConceptId): Observable<SearchResult> {
    if (id.type === 'url') return of<SearchResult>({
      selector: id,
      count: 1,
      warnings: [],
      results: [{
        id,
        domain: 'unknown',
        title: decodeURIComponent(id.id).replaceAll('&#39;',"'")
      }]
    });
    return this.bs.search({...id, shards: ['labels']})
  }
}
