import {Component, inject, signal, Signal} from '@angular/core';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';
import {map, tap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ConceptSelector} from 'concepts-common/src/interfaces/select';
import {Backend} from '../../services/backend';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [
    JsonPipe
  ],
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {
  private readonly route = inject(ActivatedRoute);
  private readonly bs = inject(Backend);

  readonly q = signal<string>('');

  readonly results = rxResource({
    params: () => this.search(),
    stream: ({ params }) => this.bs.search(params)
  });

  private search: Signal<ConceptSelector> = toSignal(
    this.route.queryParamMap.pipe(
      map(params => {
        const q = params.get('q');
        if (!q) return {q: '*'}; // TODO think about it
        this.q.set(q);
        return {q};
      })
    ),
    { requireSync: true }
  );
}
