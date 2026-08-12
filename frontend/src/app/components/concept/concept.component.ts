import {Component, computed, inject, signal, Signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {Backend} from '../../services/backend';
import {JsonPipe, NgComponentOutlet} from '@angular/common';
import {ConceptId} from 'concepts-common/interfaces/concept';
import {ConceptMenuEntry} from '../../interfaces/ui';
import {ConceptMenu} from '../concept-menu/concept-menu';
import {ConceptViewRaw} from '../concept-view-raw/concept-view-raw';
import {ConceptViewTimeline} from '../concept-view-timeline/concept-view-timeline.component';
import {ConceptAbstract} from '../concept-abstract/concept-abstract';
import {ConceptViewMap} from '../concept-view-map/concept-view-map';
import {ViewMap} from '../../interfaces/views';
import {getAvailableViews} from '../../functions/available-views';
import {ConceptViewGraph} from '../concept-view-graph/concept-view-graph';

const viewsMap: ViewMap<ConceptMenuEntry> = {
  map: {
    id: 'map',
    label: 'Map',
    component: ConceptViewMap
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    component: ConceptViewTimeline
  },
  graph: {
    id: 'graph',
    label: 'Graph',
    component: ConceptViewGraph
  },
  raw: {
    id: 'raw',
    label: 'Raw',
    component: ConceptViewRaw
  },

};

@Component({
  selector: 'app-concept',
  imports: [
    JsonPipe,
    ConceptMenu,
    NgComponentOutlet,
    ConceptAbstract
  ],
  templateUrl: './concept.component.html',
  styleUrl: './concept.component.css',
})
export class ConceptComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly bs = inject(Backend);

  readonly menu: Signal<ConceptMenuEntry[]> =
    computed(() =>
     getAvailableViews(this.concept.value())
       .map(view => Object.assign({}, viewsMap[view]))
     );

  readonly selectedViewId = signal<string>('map');
  readonly currentView: Signal<ConceptMenuEntry> =
    computed(() =>
      (this.menu().find(e => e.id === this.selectedViewId()) ?? this.menu()[0])
    );

  readonly rightSideOpen = signal(true);

  readonly concept = rxResource({
    params: () => this.params(),
    stream: ({ params }) => this.bs.getConcept(params.type, params.id)
  });

  private params: Signal<ConceptId> = toSignal(
    this.route.paramMap.pipe(
      map(params => {
        const id = params.get('id');
        const type = params.get('type');

        if (!id) throw new Error('id missing');
        if (!type) throw new Error('type missing');

        return { id, type };
      })
    ),
    { requireSync: true }
  );

  constructor() {
    this.rightSideOpen.set(localStorage.getItem("idai-concepts-concept-view-right-side-open") === 'false');
    const storedView = localStorage.getItem("idai-concepts-concept-view");
    if (storedView) {
      this.selectedViewId.set(storedView);
    }
  }

  protected menuChanged(newId: string): void {
    this.selectedViewId.set(newId);
    localStorage.setItem("idai-concepts-concept-view", newId);
  }

  protected toggleRightSide(): void {
    this.rightSideOpen.set(!this.rightSideOpen());
    localStorage.setItem("idai-concepts-concept-view-right-side-open", String(this.rightSideOpen()));
    // TODO use shard of URL to store view settings instead of localstorage
  }
}
