import {Component, inject} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {Backend} from '../../services/backend';
import {forkJoin, map, switchMap, tap} from 'rxjs';
import {ConceptId} from 'concepts-common/interfaces/concept';

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
  protected readonly titles = toSignal(
    toObservable(this.concept)
      .pipe(
        tap(e => console.log('input comes', e)),
        switchMap(concept =>
          forkJoin(
            (concept.relationsTo ?? [])
              .flatMap(rel => [
                this.bs.search({...rel.relation, shards: ['labels']}),
                ...rel.objects.map(obj => this.bs.search({...obj, shards: ['labels']}))
              ])
          )
        ),
        tap(e => console.log('next', e)),
        map(
          responses => responses
            .reduce(
              (map, response) => {
                response.results
                  .forEach(result => map.set(result.id, result.title ?? `#${result.id}`));
                return map;
              },
              new Map<ConceptId, string>()
            )
        )
    )
  );
}
