import {Component, inject, OnInit, signal} from '@angular/core';
import {lastValueFrom, of, switchMap} from 'rxjs';
import {Status} from 'concepts-common/interfaces/default';
import {BackendService} from '../../services/backend.service';
import {UserService} from '../../services/user.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {User} from 'concepts-common/interfaces/user';

@Component({
  selector: 'app-status',
  imports: [],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent implements OnInit {
  private readonly bs = inject(BackendService);
  private readonly us = inject(UserService);

  readonly user = toSignal(
    this.us.user$
      .pipe(
        switchMap(user => user ? this.bs.getUser() : of(null))
      )
  ) ;

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
