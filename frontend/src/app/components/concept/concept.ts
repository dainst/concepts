import {Component, inject, Signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {Backend} from '../../services/backend';
import {JsonPipe} from '@angular/common';
import {ConceptId} from 'concepts-common/src/interfaces/concept';

@Component({
  selector: 'app-concept',
  imports: [
    JsonPipe
  ],
  templateUrl: './concept.html',
  styleUrl: './concept.css',
})
export class Concept {
  private readonly route = inject(ActivatedRoute);
  private readonly bs = inject(Backend);

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
