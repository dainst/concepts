import {Component, computed, inject, signal, Signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {Backend} from '../../services/backend';
import {JsonPipe, NgComponentOutlet} from '@angular/common';
import {ConceptId} from 'concepts-common/src/interfaces/concept';
import {ConceptMenuEntry} from '../../interfaces/ui';
import {ConceptMenu} from '../concept-menu/concept-menu';
import {ConceptViewRaw} from '../concept-view-raw/concept-view-raw';
import {ConceptViewTimeline} from '../concept-view-timeline/concept-view-timeline.component';
import {ConceptAbstract} from '../concept-abstract/concept-abstract';
import {ConceptViewMap} from '../concept-view-map/concept-view-map';
import {ViewMap} from '../../interfaces/views';
import {getAvailableViews} from '../../functions/available-views';

const viewsMap: ViewMap<ConceptMenuEntry> = {
  map: {
    id: 'map',
    label: 'Map',
    component: ConceptViewMap
  },
  raw: {
    id: 'raw',
    label: 'Raw',
    component: ConceptViewRaw
  },
  timeline:   {
    id: 'timeline',
    label: 'Timeline',
    component: ConceptViewTimeline
  }
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
    computed(() => {
      const av = getAvailableViews(this.concept.value());
      console.log({av});
      return av.map(view => Object.assign({}, viewsMap[view]))
      }
    );
  readonly currentViewId = signal<string>('map');
  readonly currentView: Signal<ConceptMenuEntry> =
    computed(() =>
      (this.menu().find(e => e.id === this.currentViewId()) ?? this.menu()[0])
    );

  menuChanged(newId: string) {
    this.currentViewId.set(newId);
  }

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
}
