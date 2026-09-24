import {Component, inject} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {rxResource} from '@angular/core/rxjs-interop';
import {BackendService} from '../../services/backend.service';
import {map} from 'rxjs';
import {DatePipe, JsonPipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-concept-view-history',
  imports: [
    JsonPipe,
    DatePipe,
    RouterLink
  ],
  templateUrl: './concept-history.html',
  styleUrl: './concept-history.css'
})
export class ConceptViewHistory extends ConceptViewComponent {
  private readonly bs = inject(BackendService);
  protected readonly history =  rxResource({
    params: () => this.concept(),
    stream: ({params}) =>
      this.bs.getHistory(params.id.type, params.id.id)
        .pipe(map(h => typeof h === 'undefined' ? [] : h))
  });
}
