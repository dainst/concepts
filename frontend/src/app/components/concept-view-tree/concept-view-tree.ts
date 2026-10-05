import {Component, inject, ResourceRef} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {rxResource} from '@angular/core/rxjs-interop';
import {BackendService} from '../../services/backend.service';
import {AsyncPipe, NgTemplateOutlet} from '@angular/common';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import {map} from 'rxjs';
import {AnnotatedDomain} from '../../interfaces/domain';
import {TitlePipe} from '../../pipes/title-pipe';
import {DomainService} from '../../services/domain.service';


@Component({
  selector: 'app-concepot-view-tree',
  imports: [
    NgbAlert,
    NgTemplateOutlet,
    TitlePipe,
    AsyncPipe
  ],
  templateUrl: './concept-view-tree.html',
  styleUrl: './concept-view-tree.css'
})
export class ConceptViewTree extends ConceptViewComponent {
  private readonly ds = inject(DomainService);
  protected readonly domains: ResourceRef<(AnnotatedDomain)[] | undefined> = rxResource({
    params: () => this.concept(),
    stream: ({params}) => this.ds.domains$
      .pipe(
        map(domainList => domainList
          .map(domain => ({
            ...domain,
            protagonist: domain.id === params.domain
          })
        )
      )
    )
  });
}
