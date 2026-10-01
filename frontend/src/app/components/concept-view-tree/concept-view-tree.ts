import {Component, inject, ResourceRef} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {rxResource} from '@angular/core/rxjs-interop';
import {BackendService} from '../../services/backend.service';
import {AsyncPipe, JsonPipe, NgTemplateOutlet} from '@angular/common';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import {map} from 'rxjs';
import {AnnotatedDomain} from '../../interfaces/domain';
import {Domain} from 'concepts-common/interfaces/domain';
import {TitlePipe} from '../../pipes/title-pipe';


@Component({
  selector: 'app-concepot-view-tree',
  imports: [
    JsonPipe,
    NgbAlert,
    NgTemplateOutlet,
    TitlePipe,
    AsyncPipe
  ],
  templateUrl: './concept-view-tree.html',
  styleUrl: './concept-view-tree.css'
})
export class ConceptViewTree extends ConceptViewComponent {
  private readonly bs = inject(BackendService);
  protected readonly domains: ResourceRef<(AnnotatedDomain)[] | undefined> = rxResource({
    params: () => this.concept(),
    stream: ({params}) => this.bs.getDomains()
      .pipe(
        map(domainList => domainList
          .map(domain => ({
            ...domain,
            expanded: true, // domain.id === params.domain,
            protagonist: domain.id === params.domain
          })
        )
      )
    )
  });
}
