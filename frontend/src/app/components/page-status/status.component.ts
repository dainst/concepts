import {Component, inject, OnInit, signal} from '@angular/core';
import {lastValueFrom} from 'rxjs';
import {Status} from 'concepts-common/interfaces/default';
import {BackendService} from '../../services/backend.service';

@Component({
  selector: 'app-status',
  imports: [],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent implements OnInit {
  private readonly bs = inject(BackendService);

  readonly status = signal<Status>({
    app: 'concepts-frontend',
    db: {
      status: null,
      version: ''
    },
    version: '0.0.0'
  });

  private async getStatus(): Promise<void> {
    this.status.set(await lastValueFrom(this.bs.getStatus()));
  }

  ngOnInit(): void {
    void this.getStatus();
  }
}
