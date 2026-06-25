import {Component, OnInit, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {Status} from 'concepts-common/src/interfaces/default';

@Component({
  selector: 'app-status',
  imports: [],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css',
})
export class StatusComponent implements OnInit {
  constructor(
    private http: HttpClient
  ) { }

  readonly status = signal<Status>({
    app: 'concepts',
    db: {
      status: 'unknown',
      version: ''
    },
    version: '0.0.0'
  });

  async ngOnInit() {
    this.status.set(await lastValueFrom(this.http.get<Status>('http://localhost:3000')));
  }
}
