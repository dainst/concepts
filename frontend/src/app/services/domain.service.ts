import {inject, Service} from '@angular/core';
import {Observable, shareReplay} from 'rxjs';
import {Domain} from 'concepts-common/interfaces/domain';
import {BackendService} from './backend.service';

@Service()
export class DomainService {
  private readonly bs = inject(BackendService);
  readonly domains$: Observable<Domain[]> =
    this.bs.getDomains()
      .pipe(shareReplay(1));
}
