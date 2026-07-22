import {AfterViewInit, Component, computed, inject, ResourceRef, signal} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {Timeline} from '../timeline/timeline';
import {isTemporalConcept} from 'concepts-common/functions/concept.typeguards';
import {rxResource} from '@angular/core/rxjs-interop';
import {Backend} from '../../services/backend';
import {map} from 'rxjs';
import {Concept} from 'concepts-common/interfaces/concept';

@Component({
  selector: 'app-concept-view-timeline',
  imports: [
    Timeline
  ],
  templateUrl: './concept-view-timeline.component.html',
  styleUrl: './concept-view-timeline.component.css',
})
export class ConceptViewTimeline extends ConceptViewComponent implements AfterViewInit {
  private readonly bs = inject(Backend);
  private viewInitialized = signal(false);

  readonly data: ResourceRef<Concept[]|undefined> = rxResource({
    params: () => this.concept(),
    stream: ({ params }) =>
      this.bs.search({domain: params.domain, limit: 10000, shards: ['temporal_extends', 'relations']})
        .pipe(map(r => r.results))
  });

  // TODO this is ugly. use the real id
  protected selected = computed<string>(() => this.concept().id.id + '-' + this.concept().id.type);

  ngAfterViewInit() {
    this.viewInitialized.set(true);
  }
}
